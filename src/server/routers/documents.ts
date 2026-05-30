import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, workspaceProcedure } from '../trpc';

export const documentsRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(
      z.object({
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
        authorId: z.string().optional(),
        isPublic: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.document.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          OR: [{ authorId: ctx.dbUser.id }, { isPublic: true }],
          ...(input?.search && {
            title: { contains: input.search, mode: 'insensitive' },
          }),
          ...(input?.authorId && { authorId: input.authorId }),
          ...(input?.isPublic !== undefined && { isPublic: input.isPublic }),
        },
        include: { author: true },
        orderBy: { updatedAt: 'desc' },
      });
    }),

  byId: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId },
        include: { author: true },
      });
      if (!doc) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!doc.isPublic && doc.authorId !== ctx.dbUser.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return doc;
    }),

  create: workspaceProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().default(''),
        isPublic: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.document.create({
        data: { ...input, workspaceId: ctx.workspaceId, authorId: ctx.dbUser.id },
        include: { author: true },
      });
    }),

  update: workspaceProcedure
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
      const existing = await ctx.prisma.document.findFirst({
        where: { id, workspaceId: ctx.workspaceId },
      });
      if (!existing || existing.authorId !== ctx.dbUser.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return ctx.prisma.document.update({
        where: { id },
        data: { ...data, version: { increment: 1 } },
        include: { author: true },
      });
    }),

  delete: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.document.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId },
      });
      if (!existing || existing.authorId !== ctx.dbUser.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      await ctx.prisma.document.delete({ where: { id: input.id } });
      return { success: true };
    }),

  togglePublic: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.document.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId },
      });
      if (!existing || existing.authorId !== ctx.dbUser.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return ctx.prisma.document.update({
        where: { id: input.id },
        data: { isPublic: !existing.isPublic },
      });
    }),
});
