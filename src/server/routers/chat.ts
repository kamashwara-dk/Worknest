import { z } from 'zod';
import { createTRPCRouter, workspaceProcedure, workspaceManagerProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  channels: createTRPCRouter({
    list: workspaceProcedure.query(async ({ ctx }) => {
      return ctx.prisma.channel.findMany({
        where: { workspaceId: ctx.workspaceId },
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { messages: true } } },
      });
    }),

    create: workspaceManagerProcedure
      .input(
        z.object({
          name: z.string().min(1).max(50),
          description: z.string().optional(),
          isPrivate: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.channel.create({
          data: { ...input, workspaceId: ctx.workspaceId },
        });
      }),
  }),

  messages: createTRPCRouter({
    list: workspaceProcedure
      .input(
        z.object({
          channelId: z.string(),
          cursor: z.string().optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        const messages = await ctx.prisma.message.findMany({
          where: { channelId: input.channelId, channel: { workspaceId: ctx.workspaceId } },
          include: { sender: true },
          orderBy: { createdAt: 'desc' },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        });

        let nextCursor: string | undefined;
        if (messages.length > input.limit) {
          nextCursor = messages.pop()?.id;
        }

        return { messages: messages.reverse(), nextCursor };
      }),

    send: workspaceProcedure
      .input(
        z.object({
          channelId: z.string(),
          content: z.string().min(1).max(4000),
          type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
          fileUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.message.create({
          data: { ...input, senderId: ctx.dbUser.id },
          include: { sender: true },
        });
      }),

    edit: workspaceProcedure
      .input(z.object({ id: z.string(), content: z.string().min(1).max(4000) }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.message.update({
          where: { id: input.id, senderId: ctx.dbUser.id },
          data: { content: input.content, editedAt: new Date() },
          include: { sender: true },
        });
      }),
  }),
});
