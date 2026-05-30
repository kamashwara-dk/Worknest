import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, workspaceProcedure, workspaceManagerProcedure } from '../trpc';
import { sendLeaveApprovalEmail } from '@/lib/resend';

export const leavesRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
        all: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const isManagerOrAbove =
        ctx.dbMembership.role === 'MANAGER' ||
        ctx.dbMembership.role === 'ADMIN' ||
        ctx.dbMembership.role === 'OWNER';

      return ctx.prisma.leaveRequest.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          ...(input?.status && { status: input.status }),
          ...(!input?.all || !isManagerOrAbove
            ? { userId: input?.userId ?? ctx.dbUser.id }
            : {}),
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

  request: workspaceProcedure
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
        data: { ...input, workspaceId: ctx.workspaceId, userId: ctx.dbUser.id },
        include: { user: true },
      });

      // Notify workspace managers/admins/owner
      const managers = await ctx.prisma.membership.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          role: { in: ['MANAGER', 'ADMIN', 'OWNER'] },
          userId: { not: ctx.dbUser.id },
        },
        select: { userId: true },
      });

      await ctx.prisma.notification.createMany({
        data: managers.map((m) => ({
          workspaceId: ctx.workspaceId,
          userId: m.userId,
          title: 'New leave request',
          body: `${ctx.dbUser.name} has requested ${input.type.toLowerCase()} leave`,
          type: 'LEAVE_REQUEST',
          link: `/w/${ctx.workspaceId}/leaves`,
        })),
      });

      return leave;
    }),

  approve: workspaceManagerProcedure
    .input(z.object({ id: z.string(), comments: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const leave = await ctx.prisma.leaveRequest.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId },
        include: { user: true },
      });
      if (!leave) throw new TRPCError({ code: 'NOT_FOUND' });

      const updated = await ctx.prisma.leaveRequest.update({
        where: { id: input.id },
        data: { status: 'APPROVED', approvedBy: ctx.dbUser.id, comments: input.comments },
        include: { user: true },
      });

      await ctx.prisma.notification.create({
        data: {
          workspaceId: ctx.workspaceId,
          userId: leave.userId,
          title: 'Leave request approved',
          body: `Your ${leave.type.toLowerCase()} leave has been approved`,
          type: 'LEAVE_APPROVED',
          link: `/w/${ctx.workspaceId}/leaves`,
        },
      });

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

  reject: workspaceManagerProcedure
    .input(
      z.object({
        id: z.string(),
        comments: z.string().min(1, 'Please provide a reason for rejection'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leave = await ctx.prisma.leaveRequest.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId },
        include: { user: true },
      });
      if (!leave) throw new TRPCError({ code: 'NOT_FOUND' });

      const updated = await ctx.prisma.leaveRequest.update({
        where: { id: input.id },
        data: { status: 'REJECTED', approvedBy: ctx.dbUser.id, comments: input.comments },
        include: { user: true },
      });

      await ctx.prisma.notification.create({
        data: {
          workspaceId: ctx.workspaceId,
          userId: leave.userId,
          title: 'Leave request rejected',
          body: `Your ${leave.type.toLowerCase()} leave has been rejected`,
          type: 'LEAVE_REJECTED',
          link: `/w/${ctx.workspaceId}/leaves`,
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

  cancel: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const leave = await ctx.prisma.leaveRequest.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId, userId: ctx.dbUser.id },
      });
      if (!leave) throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.prisma.leaveRequest.update({
        where: { id: input.id },
        data: { status: 'CANCELLED' },
      });
    }),
});
