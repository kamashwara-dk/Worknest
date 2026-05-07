import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string(),
});

export const tasksRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        assigneeId: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input?.status && { status: input.status }),
        ...(input?.priority && { priority: input.priority }),
        ...(input?.assigneeId && { assigneeId: input.assigneeId }),
        ...(input?.search && {
          OR: [
            { title: { contains: input.search, mode: 'insensitive' as const } },
            { description: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const tasks = await ctx.prisma.task.findMany({
        where,
        include: {
          assignee: true,
          creator: true,
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip: ((input?.page ?? 1) - 1) * (input?.limit ?? 50),
        take: input?.limit ?? 50,
      });

      const total = await ctx.prisma.task.count({ where });

      return { tasks, total };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: {
          assignee: true,
          creator: true,
        },
      });

      if (!task) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }

      return task;
    }),

  create: protectedProcedure
    .input(taskCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          creatorId: ctx.dbUser!.id,
        },
        include: {
          assignee: true,
          creator: true,
        },
      });

      // Create notification for assignee
      if (input.assigneeId && input.assigneeId !== ctx.dbUser!.id) {
        await ctx.prisma.notification.create({
          data: {
            userId: input.assigneeId,
            title: 'New task assigned',
            body: `You have been assigned: "${input.title}"`,
            type: 'TASK_ASSIGNED',
            link: `/tasks`,
          },
        });
      }

      return task;
    }),

  update: protectedProcedure
    .input(taskUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.task.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }

      const task = await ctx.prisma.task.update({
        where: { id },
        data,
        include: {
          assignee: true,
          creator: true,
        },
      });

      return task;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.order !== undefined && { order: input.order }),
        },
        include: {
          assignee: true,
          creator: true,
        },
      });

      return task;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.task.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }

      await ctx.prisma.task.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
