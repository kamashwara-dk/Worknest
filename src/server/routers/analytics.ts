import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { subDays, startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

export const analyticsRouter = createTRPCRouter({
  overview: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = subDays(new Date(), days);

      const [
        totalTasks,
        completedTasks,
        activeMembersCount,
        pendingLeaves,
      ] = await Promise.all([
        ctx.prisma.task.count({
          where: { createdAt: { gte: startDate } },
        }),
        ctx.prisma.task.count({
          where: { status: 'DONE', updatedAt: { gte: startDate } },
        }),
        ctx.prisma.user.count({
          where: { isActive: true },
        }),
        ctx.prisma.leaveRequest.count({
          where: { status: 'PENDING' },
        }),
      ]);

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        totalTasks,
        completedTasks,
        completionRate,
        activeMembersCount,
        pendingLeaves,
      };
    }),

  taskTrend: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = subDays(new Date(), days);
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

      const [created, completed] = await Promise.all([
        ctx.prisma.task.groupBy({
          by: ['createdAt'],
          where: { createdAt: { gte: startDate } },
          _count: true,
        }),
        ctx.prisma.task.groupBy({
          by: ['updatedAt'],
          where: { status: 'DONE', updatedAt: { gte: startDate } },
          _count: true,
        }),
      ]);

      const createdMap = new Map<string, number>();
      const completedMap = new Map<string, number>();

      created.forEach((item) => {
        const key = format(item.createdAt, 'yyyy-MM-dd');
        createdMap.set(key, (createdMap.get(key) ?? 0) + item._count);
      });

      completed.forEach((item) => {
        const key = format(item.updatedAt, 'yyyy-MM-dd');
        completedMap.set(key, (completedMap.get(key) ?? 0) + item._count);
      });

      return dateRange.map((date) => {
        const key = format(date, 'yyyy-MM-dd');
        return {
          date: key,
          created: createdMap.get(key) ?? 0,
          completed: completedMap.get(key) ?? 0,
        };
      });
    }),

  tasksByPriority: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.task.groupBy({
      by: ['priority'],
      _count: true,
    });

    return result.map((item) => ({
      priority: item.priority,
      count: item._count,
    }));
  }),

  leavesByType: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.leaveRequest.groupBy({
      by: ['type'],
      _count: true,
      where: { status: 'APPROVED' },
    });

    return result.map((item) => ({
      type: item.type,
      count: item._count,
    }));
  }),

  teamActivity: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = subDays(new Date(), days);

      const tasks = await ctx.prisma.task.findMany({
        where: { updatedAt: { gte: startDate } },
        select: { updatedAt: true },
      });

      // Build activity heatmap data (day of week × hour)
      const heatmap: Record<string, number> = {};

      tasks.forEach((task) => {
        const day = task.updatedAt.getDay();
        const hour = task.updatedAt.getHours();
        const key = `${day}-${hour}`;
        heatmap[key] = (heatmap[key] ?? 0) + 1;
      });

      return heatmap;
    }),
});
