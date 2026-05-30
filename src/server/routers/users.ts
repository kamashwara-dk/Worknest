import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, workspaceProcedure, workspaceAdminProcedure } from '../trpc';

export const usersRouter = createTRPCRouter({
  // Current user profile — no workspace scope needed
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.dbUser!.id },
      include: {
        _count: {
          select: { tasks: true, leaveRequests: true, documents: true, notes: true },
        },
      },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    return user;
  }),

  // List members of the active workspace
  list: workspaceProcedure
    .input(
      z.object({
        search: z.string().optional(),
        department: z.string().optional(),
        role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const memberships = await ctx.prisma.membership.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          ...(input?.role && { role: input.role }),
          ...(input?.search || input?.department
            ? {
                user: {
                  ...(input.search && {
                    OR: [
                      { name: { contains: input.search, mode: 'insensitive' } },
                      { email: { contains: input.search, mode: 'insensitive' } },
                      { designation: { contains: input.search, mode: 'insensitive' } },
                    ],
                  }),
                  ...(input.department && { department: input.department }),
                },
              }
            : {}),
        },
        include: { user: true },
        orderBy: { user: { name: 'asc' } },
      });

      return memberships.map((m) => ({ ...m.user, workspaceRole: m.role }));
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        avatar: z.string().url().optional().or(z.literal('')),
        designation: z.string().max(100).optional(),
        department: z.string().max(100).optional(),
        phone: z.string().max(20).optional(),
        bio: z.string().max(300).optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        twitterUrl: z.string().url().optional().or(z.literal('')),
        githubUrl: z.string().url().optional().or(z.literal('')),
        websiteUrl: z.string().url().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        linkedinUrl: input.linkedinUrl || null,
        twitterUrl: input.twitterUrl || null,
        githubUrl: input.githubUrl || null,
        websiteUrl: input.websiteUrl || null,
        avatar: input.avatar || undefined,
      };
      return ctx.prisma.user.update({ where: { id: ctx.dbUser!.id }, data });
    }),

  // Deactivate/activate are now workspace-admin actions
  deactivate: workspaceAdminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.dbUser.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot deactivate yourself' });
      }
      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { isActive: false },
      });
    }),

  activate: workspaceAdminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { isActive: true },
      });
    }),
});
