import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  channels: createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      const channels = await ctx.prisma.channel.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          _count: {
            select: { messages: true },
          },
        },
      });
      return channels;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(50),
          description: z.string().optional(),
          isPrivate: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const channel = await ctx.prisma.channel.create({
          data: input,
        });
        return channel;
      }),
  }),

  messages: createTRPCRouter({
    list: protectedProcedure
      .input(
        z.object({
          channelId: z.string(),
          cursor: z.string().optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        const messages = await ctx.prisma.message.findMany({
          where: { channelId: input.channelId },
          include: {
            sender: true,
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit + 1,
          ...(input.cursor && {
            cursor: { id: input.cursor },
            skip: 1,
          }),
        });

        let nextCursor: string | undefined;
        if (messages.length > input.limit) {
          const nextItem = messages.pop();
          nextCursor = nextItem?.id;
        }

        return {
          messages: messages.reverse(),
          nextCursor,
        };
      }),

    send: protectedProcedure
      .input(
        z.object({
          channelId: z.string(),
          content: z.string().min(1).max(4000),
          type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
          fileUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const message = await ctx.prisma.message.create({
          data: {
            ...input,
            senderId: ctx.dbUser!.id,
          },
          include: {
            sender: true,
          },
        });

        return message;
      }),

    edit: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          content: z.string().min(1).max(4000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const message = await ctx.prisma.message.update({
          where: { id: input.id, senderId: ctx.dbUser!.id },
          data: {
            content: input.content,
            editedAt: new Date(),
          },
          include: { sender: true },
        });
        return message;
      }),
  }),
});
