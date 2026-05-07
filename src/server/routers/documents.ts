import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const documentsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
        authorId: z.string().optional(),
        isPublic: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const documents = await ctx.prisma.document.findMany({
        where: {
          OR: [
            { authorId: ctx.dbUser!.id },
            { isPublic: true },
          ],
          ...(input?.search && {
            OR: [
              { title: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
          ...(input?.authorId && { authorId: input.authorId }),
          ...(input?.isPublic !== undefined && { isPublic: input.isPublic }),
        },
        include: { author: true },
        orderBy: { updatedAt: 'desc' },
      });

      return documents;
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.findUnique({
        where: { id: input.id },
        include: { author: true },
      });

      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (!doc.isPublic && doc.authorId !== ctx.dbUser!.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return doc;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().default(''),
        isPublic: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.create({
        data: {
          ...input,
          authorId: ctx.dbUser!.id,
        },
        include: { author: true },
      });
      return doc;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().optional(),
        isPublic: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.document.findUnique({ where: { id } });
      if (!existing || existing.authorId !== ctx.dbUser!.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const doc = await ctx.prisma.document.update({
        where: { id },
        data: {
          ...data,
          version: { increment: 1 },
        },
        include: { author: true },
      });

      return doc;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.document.findUnique({ where: { id: input.id } });
      if (!existing || existing.authorId !== ctx.dbUser!.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await ctx.prisma.document.delete({ where: { id: input.id } });
      return { success: true };
    }),

  togglePublic: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.document.findUnique({ where: { id: input.id } });
      if (!existing || existing.authorId !== ctx.dbUser!.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.document.update({
        where: { id: input.id },
        data: { isPublic: !existing.isPublic },
      });
    }),
});
