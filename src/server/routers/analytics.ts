import { z } from 'zod';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { subDays, eachDayOfInterval, format } from 'date-fns';

export const analyticsRouter = createTRPCRouter({
  overview: workspaceProcedure
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = subDays(new Date(), days);

      const [totalTasks, completedTasks, activeMembersCount, pendingLeaves] =
        await Promise.all([
          ctx.prisma.task.count({
            where: { workspaceId: ctx.workspaceId, createdAt: { gte: startDate } },
          }),
          ctx.prisma.task.count({
            where: { workspaceId: ctx.workspaceId, status: 'DONE', updatedAt: { gte: startDate } },
          }),
          ctx.prisma.membership.count({
            where: { workspaceId: ctx.workspaceId },
          }),
          ctx.prisma.leaveRequest.count({
            where: { workspaceId: ctx.workspaceId, status: 'PENDING' },
          }),
        ]);

      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return { totalTasks, completedTasks, completionRate, activeMembersCount, pendingLeaves };
    }),

  taskTrend: workspaceProcedure
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = subDays(new Date(), days);
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

      const [created, completed] = await Promise.all([
        ctx.prisma.task.groupBy({
          by: ['createdAt'],
          where: { workspaceId: ctx.workspaceId, createdAt: { gte: startDate } },
          _count: true,
        }),
        ctx.prisma.task.groupBy({
          by: ['updatedAt'],
          where: { workspaceId: ctx.workspaceId, status: 'DONE', updatedAt: { gte: startDate } },
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
        return { date: key, created: createdMap.get(key) ?? 0, completed: completedMap.get(key) ?? 0 };
      });
    }),

  tasksByPriority: workspaceProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.task.groupBy({
      by: ['priority'],
      where: { workspaceId: ctx.workspaceId },
      _count: true,
    });
    return result.map((item) => ({ priority: item.priority, count: item._count }));
  }),

  leavesByType: workspaceProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.leaveRequest.groupBy({
      by: ['type'],
      where: { workspaceId: ctx.workspaceId, status: 'APPROVED' },
      _count: true,
    });
    return result.map((item) => ({ type: item.type, count: item._count }));
  }),

  teamActivity: workspaceProcedure
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = subDays(new Date(), days);

      const tasks = await ctx.prisma.task.findMany({
        where: { workspaceId: ctx.workspaceId, updatedAt: { gte: startDate } },
        select: { updatedAt: true },
      });

      const heatmap: Record<string, number> = {};
      tasks.forEach((task) => {
        const key = `${task.updatedAt.getDay()}-${task.updatedAt.getHours()}`;
        heatmap[key] = (heatmap[key] ?? 0) + 1;
      });

      return heatmap;
    }),
});
