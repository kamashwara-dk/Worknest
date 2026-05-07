import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, managerProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const announcementsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        pinned: z.boolean().optional(),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const announcements = await ctx.prisma.announcement.findMany({
        where: {
          ...(input?.pinned !== undefined && { pinned: input.pinned }),
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take: input?.limit ?? 20,
      });

      return announcements;
    }),

  create: managerProcedure
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
        data: {
          ...input,
          authorId: ctx.dbUser!.id,
        },
      });

      // Notify all active users
      const users = await ctx.prisma.user.findMany({
        where: { isActive: true, id: { not: ctx.dbUser!.id } },
        select: { id: true },
      });

      await ctx.prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          title: 'New announcement',
          body: input.title,
          type: 'ANNOUNCEMENT',
          link: '/announcements',
        })),
      });

      return announcement;
    }),

  update: managerProcedure
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
      return ctx.prisma.announcement.update({
        where: { id },
        data,
      });
    }),

  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.announcement.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      await ctx.prisma.announcement.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
