import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
  workspaceManagerProcedure,
  workspaceAdminProcedure,
} from '../trpc';
import { generateJoinCode, normaliseJoinCode } from '@/lib/joinCode';

// Converts a workspace name to a URL-safe slug, e.g. "Acme Corp" → "acme-corp"
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

export const workspacesRouter = createTRPCRouter({
  // ── List all workspaces the current user belongs to ──────────────────────
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.prisma.membership.findMany({
      where: { userId: ctx.dbUser!.id },
      include: { workspace: true },
      orderBy: { joinedAt: 'asc' },
    });
    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      membershipId: m.id,
    }));
  }),

  // ── Get a single workspace by slug ───────────────────────────────────────
  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { slug: input.slug },
        include: { _count: { select: { memberships: true } } },
      });
      if (!workspace) throw new TRPCError({ code: 'NOT_FOUND' });

      // Verify caller is a member
      const membership = await ctx.prisma.membership.findUnique({
        where: {
          userId_workspaceId: { userId: ctx.dbUser!.id, workspaceId: workspace.id },
        },
      });
      if (!membership) throw new TRPCError({ code: 'FORBIDDEN' });

      return { ...workspace, role: membership.role };
    }),

  // ── Create a new workspace ───────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(80),
        logoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const baseSlug = toSlug(input.name);

      // Ensure slug uniqueness by appending a short suffix if needed
      let slug = baseSlug;
      const existing = await ctx.prisma.workspace.findUnique({ where: { slug } });
      if (existing) {
        slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.name,
          slug,
          logoUrl: input.logoUrl ?? null,
          ownerId: ctx.dbUser!.id,
          joinCode: generateJoinCode(),
          memberships: {
            create: {
              userId: ctx.dbUser!.id,
              role: 'OWNER',
            },
          },
          // Seed default channels
          channels: {
            create: [
              { name: 'general', description: 'General team discussions' },
              { name: 'announcements', description: 'Company announcements' },
            ],
          },
        },
        include: { memberships: true },
      });

      return workspace;
    }),

  // ── Update workspace name / logo (admin+) ────────────────────────────────
  update: workspaceAdminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(80).optional(),
        logoUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workspace.update({
        where: { id: ctx.workspaceId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        },
      });
    }),

  // ── Delete workspace (owner only) ────────────────────────────────────────
  delete: workspaceProcedure.mutation(async ({ ctx }) => {
    if (ctx.dbMembership.role !== 'OWNER') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the owner can delete a workspace' });
    }
    await ctx.prisma.workspace.delete({ where: { id: ctx.workspaceId } });
    return { success: true };
  }),

  // ── Members sub-router ───────────────────────────────────────────────────
  members: createTRPCRouter({
    list: workspaceProcedure.query(async ({ ctx }) => {
      return ctx.prisma.membership.findMany({
        where: { workspaceId: ctx.workspaceId },
        include: { user: true },
        orderBy: { joinedAt: 'asc' },
      });
    }),

    updateRole: workspaceAdminProcedure
      .input(
        z.object({
          userId: z.string(),
          role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Cannot change the owner's role
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { id: ctx.workspaceId },
        });
        if (workspace?.ownerId === input.userId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: "Cannot change the owner's role" });
        }
        return ctx.prisma.membership.update({
          where: {
            userId_workspaceId: { userId: input.userId, workspaceId: ctx.workspaceId },
          },
          data: { role: input.role },
        });
      }),

    remove: workspaceAdminProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { id: ctx.workspaceId },
        });
        if (workspace?.ownerId === input.userId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot remove the workspace owner' });
        }
        await ctx.prisma.membership.delete({
          where: {
            userId_workspaceId: { userId: input.userId, workspaceId: ctx.workspaceId },
          },
        });
        return { success: true };
      }),

    leave: workspaceProcedure.mutation(async ({ ctx }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: ctx.workspaceId },
      });
      if (workspace?.ownerId === ctx.dbUser.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Transfer ownership before leaving',
        });
      }
      await ctx.prisma.membership.delete({
        where: {
          userId_workspaceId: { userId: ctx.dbUser.id, workspaceId: ctx.workspaceId },
        },
      });
      return { success: true };
    }),
  }),

  // ── Join code management ─────────────────────────────────────────────────

  // Get the current workspace's join code (managers+)
  getJoinCode: workspaceManagerProcedure.query(async ({ ctx }) => {
    const ws = await ctx.prisma.workspace.findUnique({
      where: { id: ctx.workspaceId },
      select: { joinCode: true, joinCodeEnabled: true },
    });
    if (!ws) throw new TRPCError({ code: 'NOT_FOUND' });
    return ws;
  }),

  // Regenerate the join code (admin+)
  regenerateJoinCode: workspaceAdminProcedure.mutation(async ({ ctx }) => {
    // Keep regenerating until we get a unique code
    let joinCode = generateJoinCode();
    while (await ctx.prisma.workspace.findUnique({ where: { joinCode } })) {
      joinCode = generateJoinCode();
    }
    return ctx.prisma.workspace.update({
      where: { id: ctx.workspaceId },
      data: { joinCode },
      select: { joinCode: true, joinCodeEnabled: true },
    });
  }),

  // Enable or disable the join code (admin+)
  toggleJoinCode: workspaceAdminProcedure.mutation(async ({ ctx }) => {
    const ws = await ctx.prisma.workspace.findUnique({
      where: { id: ctx.workspaceId },
      select: { joinCodeEnabled: true },
    });
    if (!ws) throw new TRPCError({ code: 'NOT_FOUND' });
    return ctx.prisma.workspace.update({
      where: { id: ctx.workspaceId },
      data: { joinCodeEnabled: !ws.joinCodeEnabled },
      select: { joinCode: true, joinCodeEnabled: true },
    });
  }),

  // Join a workspace by entering its code (any authenticated user)
  joinByCode: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const normalised = normaliseJoinCode(input.code);

      const workspace = await ctx.prisma.workspace.findUnique({
        where: { joinCode: normalised },
      });

      if (!workspace) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid workspace code' });
      }
      if (!workspace.joinCodeEnabled) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'This workspace is not accepting new members via code' });
      }

      // Already a member?
      const existing = await ctx.prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: ctx.dbUser!.id, workspaceId: workspace.id } },
      });
      if (existing) {
        // Just return the workspace so the client can navigate there
        return { membership: existing, workspace };
      }

      const membership = await ctx.prisma.membership.create({
        data: { userId: ctx.dbUser!.id, workspaceId: workspace.id, role: 'MEMBER' },
      });

      return { membership, workspace };
    }),

  // ── Invite links ─────────────────────────────────────────────────────────

  inviteLinks: createTRPCRouter({
    // List all invite links for the active workspace
    list: workspaceManagerProcedure.query(async ({ ctx }) => {
      return ctx.prisma.workspaceInviteLink.findMany({
        where: { workspaceId: ctx.workspaceId },
        include: { createdBy: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }),

    // Create a new invite link
    create: workspaceManagerProcedure
      .input(
        z.object({
          label: z.string().max(80).optional(),
          maxUses: z.number().int().positive().optional(),
          expiresInDays: z.number().int().positive().max(365).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const expiresAt = input.expiresInDays
          ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
          : null;

        return ctx.prisma.workspaceInviteLink.create({
          data: {
            workspaceId: ctx.workspaceId,
            createdById: ctx.dbUser.id,
            label: input.label ?? null,
            maxUses: input.maxUses ?? null,
            expiresAt,
          },
        });
      }),

    // Deactivate an invite link
    deactivate: workspaceManagerProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const link = await ctx.prisma.workspaceInviteLink.findUnique({ where: { id: input.id } });
        if (!link || link.workspaceId !== ctx.workspaceId) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        return ctx.prisma.workspaceInviteLink.update({
          where: { id: input.id },
          data: { isActive: false },
        });
      }),

    // Delete an invite link
    delete: workspaceAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const link = await ctx.prisma.workspaceInviteLink.findUnique({ where: { id: input.id } });
        if (!link || link.workspaceId !== ctx.workspaceId) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        await ctx.prisma.workspaceInviteLink.delete({ where: { id: input.id } });
        return { success: true };
      }),

    // Preview an invite link (public — no workspace header needed)
    preview: protectedProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ ctx, input }) => {
        const link = await ctx.prisma.workspaceInviteLink.findUnique({
          where: { token: input.token },
          include: {
            workspace: { select: { id: true, name: true, slug: true, logoUrl: true } },
            createdBy: { select: { name: true, avatar: true } },
          },
        });

        if (!link) throw new TRPCError({ code: 'NOT_FOUND' });

        const expired = link.expiresAt && link.expiresAt < new Date();
        const maxedOut = link.maxUses !== null && link.useCount >= link.maxUses;

        return {
          ...link,
          isValid: link.isActive && !expired && !maxedOut,
          reason: !link.isActive ? 'deactivated'
            : expired ? 'expired'
            : maxedOut ? 'max_uses_reached'
            : null,
        };
      }),

    // Accept an invite link (any authenticated user)
    accept: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const link = await ctx.prisma.workspaceInviteLink.findUnique({
          where: { token: input.token },
          include: { workspace: true },
        });

        if (!link) throw new TRPCError({ code: 'NOT_FOUND' });
        if (!link.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'This invite link has been deactivated' });
        if (link.expiresAt && link.expiresAt < new Date()) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'This invite link has expired' });
        }
        if (link.maxUses !== null && link.useCount >= link.maxUses) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'This invite link has reached its maximum uses' });
        }

        // Already a member — just return workspace
        const existing = await ctx.prisma.membership.findUnique({
          where: { userId_workspaceId: { userId: ctx.dbUser!.id, workspaceId: link.workspaceId } },
        });
        if (existing) return { membership: existing, workspace: link.workspace };

        // Create membership + increment use count atomically
        const [membership] = await ctx.prisma.$transaction([
          ctx.prisma.membership.create({
            data: { userId: ctx.dbUser!.id, workspaceId: link.workspaceId, role: 'MEMBER' },
          }),
          ctx.prisma.workspaceInviteLink.update({
            where: { id: link.id },
            data: { useCount: { increment: 1 } },
          }),
        ]);

        return { membership, workspace: link.workspace };
      }),
  }),
});
