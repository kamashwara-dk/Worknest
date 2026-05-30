import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
  workspaceManagerProcedure,
  workspaceAdminProcedure,
} from '../trpc';

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
});
