import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// Notes are entirely private — no workspace scope, no sharing.
// Every query is hard-filtered to ctx.dbUser!.id.

export const notesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          tags: z.array(z.string()).optional(),
          pinned: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.note.findMany({
        where: {
          userId: ctx.dbUser!.id,
          ...(input?.pinned !== undefined && { pinned: input.pinned }),
          ...(input?.search && {
            OR: [
              { title: { contains: input.search, mode: 'insensitive' } },
              { content: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
          ...(input?.tags?.length && {
            tags: { hasSome: input.tags },
          }),
        },
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const note = await ctx.prisma.note.findUnique({ where: { id: input.id } });
      if (!note) throw new TRPCError({ code: 'NOT_FOUND' });
      if (note.userId !== ctx.dbUser!.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return note;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().default(''),
        color: z.string().optional(),
        tags: z.array(z.string()).default([]),
        pinned: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.note.create({
        data: { ...input, userId: ctx.dbUser!.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().optional(),
        color: z.string().optional().nullable(),
        tags: z.array(z.string()).optional(),
        pinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const note = await ctx.prisma.note.findUnique({ where: { id } });
      if (!note) throw new TRPCError({ code: 'NOT_FOUND' });
      if (note.userId !== ctx.dbUser!.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.prisma.note.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.prisma.note.findUnique({ where: { id: input.id } });
      if (!note) throw new TRPCError({ code: 'NOT_FOUND' });
      if (note.userId !== ctx.dbUser!.id) throw new TRPCError({ code: 'FORBIDDEN' });
      await ctx.prisma.note.delete({ where: { id: input.id } });
      return { success: true };
    }),

  pin: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.prisma.note.findUnique({ where: { id: input.id } });
      if (!note) throw new TRPCError({ code: 'NOT_FOUND' });
      if (note.userId !== ctx.dbUser!.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.prisma.note.update({
        where: { id: input.id },
        data: { pinned: !note.pinned },
      });
    }),
});
