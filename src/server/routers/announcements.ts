import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, workspaceProcedure, workspaceManagerProcedure } from '../trpc';

export const announcementsRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(
      z.object({
        pinned: z.boolean().optional(),
        limit: z.number().default(20),
      }).optional()
    )
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
    .input(
      z.object({
        title: z.string().min(1).max(200),
        body: z.string().min(1),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
        pinned: z.boolean().default(false),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.prisma.announcement.create({
        data: { ...input, workspaceId: ctx.workspaceId, authorId: ctx.dbUser.id },
      });

      // Notify all workspace members except the author
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
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        body: z.string().min(1).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        pinned: z.boolean().optional(),
        expiresAt: z.date().optional().nullable(),
      })
    )
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
});
