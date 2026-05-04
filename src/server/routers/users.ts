import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.dbUser!.id },
      include: {
        _count: {
          select: {
            tasks: true,
            leaveRequests: true,
            documents: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return user;
  }),

  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        department: z.string().optional(),
        role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          isActive: input?.isActive ?? true,
          ...(input?.search && {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { email: { contains: input.search, mode: 'insensitive' } },
              { designation: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
          ...(input?.department && { department: input.department }),
          ...(input?.role && { role: input.role }),
        },
        orderBy: { name: 'asc' },
      });

      return users;
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
      // Convert empty strings to null for URL fields
      const data = {
        ...input,
        linkedinUrl: input.linkedinUrl || null,
        twitterUrl: input.twitterUrl || null,
        githubUrl: input.githubUrl || null,
        websiteUrl: input.websiteUrl || null,
        avatar: input.avatar || undefined,
      };
      const user = await ctx.prisma.user.update({
        where: { id: ctx.dbUser!.id },
        data,
      });
      return user;
    }),

  deactivate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.dbUser!.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot deactivate yourself' });
      }

      return ctx.prisma.user.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  activate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.id },
        data: { isActive: true },
      });
    }),
});
