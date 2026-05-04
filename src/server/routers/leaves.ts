import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, managerProcedure } from '../trpc';
import { sendLeaveApprovalEmail } from '@/lib/resend';
import { TRPCError } from '@trpc/server';

export const leavesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
        all: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const isManagerOrAdmin =
        ctx.dbUser?.role === 'MANAGER' || ctx.dbUser?.role === 'ADMIN';

      const where = {
        ...(input?.status && { status: input.status }),
        ...(!input?.all || !isManagerOrAdmin
          ? { userId: input?.userId ?? ctx.dbUser!.id }
          : {}),
      };

      const leaves = await ctx.prisma.leaveRequest.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });

      return leaves;
    }),

  request: protectedProcedure
    .input(
      z.object({
        type: z.enum(['SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID']),
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leave = await ctx.prisma.leaveRequest.create({
        data: {
          ...input,
          userId: ctx.dbUser!.id,
        },
        include: { user: true },
      });

      // Notify managers
      const managers = await ctx.prisma.user.findMany({
        where: { role: { in: ['MANAGER', 'ADMIN'] }, isActive: true },
      });

      await Promise.all(
        managers.map((manager) =>
          ctx.prisma.notification.create({
            data: {
              userId: manager.id,
              title: 'New leave request',
              body: `${ctx.dbUser!.name} has requested ${input.type.toLowerCase()} leave`,
              type: 'LEAVE_REQUEST',
              link: '/leaves',
            },
          })
        )
      );

      return leave;
    }),

  approve: managerProcedure
    .input(
      z.object({
        id: z.string(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leave = await ctx.prisma.leaveRequest.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!leave) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave request not found' });
      }

      const updated = await ctx.prisma.leaveRequest.update({
        where: { id: input.id },
        data: {
          status: 'APPROVED',
          approvedBy: ctx.dbUser!.id,
          comments: input.comments,
        },
        include: { user: true },
      });

      // Notify employee
      await ctx.prisma.notification.create({
        data: {
          userId: leave.userId,
          title: 'Leave request approved',
          body: `Your ${leave.type.toLowerCase()} leave has been approved`,
          type: 'LEAVE_APPROVED',
          link: '/leaves',
        },
      });

      // Send email
      await sendLeaveApprovalEmail(
        leave.user.email,
        leave.user.name,
        'APPROVED',
        leave.type,
        leave.startDate.toDateString(),
        leave.endDate.toDateString(),
        input.comments
      );

      return updated;
    }),

  reject: managerProcedure
    .input(
      z.object({
        id: z.string(),
        comments: z.string().min(1, 'Please provide a reason for rejection'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leave = await ctx.prisma.leaveRequest.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!leave) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave request not found' });
      }

      const updated = await ctx.prisma.leaveRequest.update({
        where: { id: input.id },
        data: {
          status: 'REJECTED',
          approvedBy: ctx.dbUser!.id,
          comments: input.comments,
        },
        include: { user: true },
      });

      await ctx.prisma.notification.create({
        data: {
          userId: leave.userId,
          title: 'Leave request rejected',
          body: `Your ${leave.type.toLowerCase()} leave has been rejected`,
          type: 'LEAVE_REJECTED',
          link: '/leaves',
        },
      });

      await sendLeaveApprovalEmail(
        leave.user.email,
        leave.user.name,
        'REJECTED',
        leave.type,
        leave.startDate.toDateString(),
        leave.endDate.toDateString(),
        input.comments
      );

      return updated;
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const leave = await ctx.prisma.leaveRequest.findUnique({
        where: { id: input.id },
      });

      if (!leave || leave.userId !== ctx.dbUser!.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.leaveRequest.update({
        where: { id: input.id },
        data: { status: 'CANCELLED' },
      });
    }),
});
