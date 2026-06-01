import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, superAdminProcedure } from '../trpc';

export const feedbackRouter = createTRPCRouter({
  // Any authenticated user can submit feedback
  submit: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, 'Message is required').max(500),
        emoji: z.string().default('💬'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.feedback.create({
        data: {
          userId: ctx.dbUser!.id,
          message: input.message,
          emoji: input.emoji,
        },
      });
    }),

  // Super admin reads all submissions
  list: superAdminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const items = await ctx.prisma.feedback.findMany({
        take: limit + 1,
        ...(input?.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        nextCursor = items.pop()?.id;
      }

      return { items, nextCursor };
    }),

  // Super admin deletes a submission
  delete: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.feedback.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.feedback.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
