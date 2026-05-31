import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
  workspaceManagerProcedure,
  superAdminProcedure,
} from '../trpc';

const announcementInputSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  pinned: z.boolean().default(false),
  expiresAt: z.date().optional(),
});

export const announcementsRouter = createTRPCRouter({
  // ── Workspace announcements ───────────────────────────────────────────────

  list: workspaceProcedure
    .input(z.object({ pinned: z.boolean().optional(), limit: z.number().default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      return ctx.prisma.announcement.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          ...(input?.pinned !== undefined && { pinned: input.pinned }),
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take: input?.limit ?? 20,
      });
    }),

  create: workspaceManagerProcedure
    .input(announcementInputSchema)
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.prisma.announcement.create({
        data: { ...input, workspaceId: ctx.workspaceId, authorId: ctx.dbUser.id },
      });

      const members = await ctx.prisma.membership.findMany({
        where: { workspaceId: ctx.workspaceId, userId: { not: ctx.dbUser.id } },
        select: { userId: true },
      });

      await ctx.prisma.notification.createMany({
        data: members.map((m) => ({
          workspaceId: ctx.workspaceId,
          userId: m.userId,
          title: 'New announcement',
          body: input.title,
          type: 'ANNOUNCEMENT',
          link: `/w/${ctx.workspaceId}/announcements`,
        })),
      });

      return announcement;
    }),

  update: workspaceManagerProcedure
    .input(announcementInputSchema.partial().extend({ id: z.string(), expiresAt: z.date().optional().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await ctx.prisma.announcement.findFirst({
        where: { id, workspaceId: ctx.workspaceId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.announcement.update({ where: { id }, data });
    }),

  delete: workspaceManagerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.announcement.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.announcement.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ── Global announcements (super admin only) ───────────────────────────────

  global: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        const now = new Date();
        return ctx.prisma.globalAnnouncement.findMany({
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
          take: input?.limit ?? 20,
        });
      }),

    create: superAdminProcedure
      .input(announcementInputSchema)
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.globalAnnouncement.create({
          data: { ...input, authorId: ctx.dbUser!.id },
        });
      }),

    delete: superAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.prisma.globalAnnouncement.findUnique({
          where: { id: input.id },
        });
        if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
        await ctx.prisma.globalAnnouncement.delete({ where: { id: input.id } });
        return { success: true };
      }),
  }),

  // ── Share note as workspace announcement ──────────────────────────────────
  // Called from /notes — publishes a note as an announcement in a target workspace.
  // The caller must be a Manager/Admin/Owner in that workspace.

  shareFromNote: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        title: z.string().min(1).max(200),
        body: z.string().min(1),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
        pinned: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the caller is a member of the target workspace
      const membership = await ctx.prisma.membership.findUnique({
        where: {
          userId_workspaceId: { userId: ctx.dbUser!.id, workspaceId: input.workspaceId },
        },
      });

      if (!membership) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this workspace' });
      }

      // Enforce manager+ role in the target workspace
      const allowed: string[] = ['MANAGER', 'ADMIN', 'OWNER'];
      if (!allowed.includes(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only Managers, Admins, and Owners can publish announcements',
        });
      }

      const { workspaceId, ...rest } = input;

      const announcement = await ctx.prisma.announcement.create({
        data: { ...rest, workspaceId, authorId: ctx.dbUser!.id },
      });

      // Notify workspace members
      const members = await ctx.prisma.membership.findMany({
        where: { workspaceId, userId: { not: ctx.dbUser!.id } },
        select: { userId: true },
      });

      await ctx.prisma.notification.createMany({
        data: members.map((m) => ({
          workspaceId,
          userId: m.userId,
          title: 'New announcement',
          body: input.title,
          type: 'ANNOUNCEMENT',
          link: `/w/${workspaceId}/announcements`,
        })),
      });

      return announcement;
    }),
});
