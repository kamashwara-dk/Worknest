import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, workspaceProcedure } from '../trpc';

export const notificationsRouter = createTRPCRouter({
  // Returns notifications for the active workspace (requires workspace header)
  list: workspaceProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        unreadOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId: ctx.dbUser.id,
          workspaceId: ctx.workspaceId,
          ...(input?.unreadOnly && { read: false }),
        },
        orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
        take: input?.limit ?? 20,
      });

      const unreadCount = await ctx.prisma.notification.count({
        where: { userId: ctx.dbUser.id, workspaceId: ctx.workspaceId, read: false },
      });

      return { notifications, unreadCount };
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.notification.update({
        where: { id: input.id, userId: ctx.dbUser!.id },
        data: { read: true },
      });
    }),

  markAllRead: workspaceProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: { userId: ctx.dbUser.id, workspaceId: ctx.workspaceId, read: false },
      data: { read: true },
    });
    return { success: true };
  }),

  clear: workspaceProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.deleteMany({
      where: { userId: ctx.dbUser.id, workspaceId: ctx.workspaceId, read: true },
    });
    return { success: true };
  }),
});
