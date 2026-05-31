import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, workspaceProcedure, workspaceManagerProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  // ── Channels ──────────────────────────────────────────────────────────────
  channels: createTRPCRouter({
    list: workspaceProcedure.query(async ({ ctx }) => {
      return ctx.prisma.channel.findMany({
        where: { workspaceId: ctx.workspaceId },
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { messages: true } } },
      });
    }),

    create: workspaceManagerProcedure
      .input(z.object({
        name: z.string().min(1).max(50),
        description: z.string().optional(),
        isPrivate: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.channel.create({
          data: { ...input, workspaceId: ctx.workspaceId },
        });
      }),
  }),

  // ── Messages (channel) ────────────────────────────────────────────────────
  messages: createTRPCRouter({
    list: workspaceProcedure
      .input(z.object({
        channelId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        const messages = await ctx.prisma.message.findMany({
          where: { channelId: input.channelId, channel: { workspaceId: ctx.workspaceId } },
          include: { sender: true },
          orderBy: { createdAt: 'desc' },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        });

        let nextCursor: string | undefined;
        if (messages.length > input.limit) nextCursor = messages.pop()?.id;
        return { messages: messages.reverse(), nextCursor };
      }),

    send: workspaceProcedure
      .input(z.object({
        channelId: z.string(),
        content: z.string().min(1).max(4000),
        type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
        fileUrl: z.string().optional(),
      }))
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

  // ── Direct Messages ───────────────────────────────────────────────────────
  dm: createTRPCRouter({
    // List all DM conversations for the current user in this workspace
    conversations: workspaceProcedure.query(async ({ ctx }) => {
      const convs = await ctx.prisma.conversation.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          OR: [
            { memberOneId: ctx.dbUser.id },
            { memberTwoId: ctx.dbUser.id },
          ],
        },
        include: {
          memberOne: { select: { id: true, name: true, avatar: true, email: true } },
          memberTwo: { select: { id: true, name: true, avatar: true, email: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Return with the "other" member resolved
      return convs.map((c) => ({
        ...c,
        other: c.memberOneId === ctx.dbUser.id ? c.memberTwo : c.memberOne,
        lastMessage: c.messages[0] ?? null,
      }));
    }),

    // Get or create a conversation between current user and another member
    getOrCreate: workspaceProcedure
      .input(z.object({ otherUserId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.otherUserId === ctx.dbUser.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot DM yourself' });
        }

        // Verify the other user is a workspace member
        const otherMembership = await ctx.prisma.membership.findUnique({
          where: {
            userId_workspaceId: { userId: input.otherUserId, workspaceId: ctx.workspaceId },
          },
        });
        if (!otherMembership) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User is not a member of this workspace' });
        }

        // Canonical ordering: smaller id is always memberOne
        const [memberOneId, memberTwoId] = [ctx.dbUser.id, input.otherUserId].sort();

        const conversation = await ctx.prisma.conversation.upsert({
          where: {
            workspaceId_memberOneId_memberTwoId: {
              workspaceId: ctx.workspaceId,
              memberOneId,
              memberTwoId,
            },
          },
          update: {},
          create: { workspaceId: ctx.workspaceId, memberOneId, memberTwoId },
          include: {
            memberOne: { select: { id: true, name: true, avatar: true, email: true } },
            memberTwo: { select: { id: true, name: true, avatar: true, email: true } },
          },
        });

        return {
          ...conversation,
          other: conversation.memberOneId === ctx.dbUser.id
            ? conversation.memberTwo
            : conversation.memberOne,
        };
      }),

    // List messages in a DM conversation (cursor-based pagination)
    messages: workspaceProcedure
      .input(z.object({
        conversationId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        // Verify caller is a participant
        const conv = await ctx.prisma.conversation.findFirst({
          where: {
            id: input.conversationId,
            workspaceId: ctx.workspaceId,
            OR: [{ memberOneId: ctx.dbUser.id }, { memberTwoId: ctx.dbUser.id }],
          },
        });
        if (!conv) throw new TRPCError({ code: 'FORBIDDEN' });

        const messages = await ctx.prisma.message.findMany({
          where: { conversationId: input.conversationId },
          include: { sender: true },
          orderBy: { createdAt: 'desc' },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        });

        let nextCursor: string | undefined;
        if (messages.length > input.limit) nextCursor = messages.pop()?.id;
        return { messages: messages.reverse(), nextCursor };
      }),

    // Send a DM
    send: workspaceProcedure
      .input(z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(4000),
        type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
        fileUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify caller is a participant
        const conv = await ctx.prisma.conversation.findFirst({
          where: {
            id: input.conversationId,
            workspaceId: ctx.workspaceId,
            OR: [{ memberOneId: ctx.dbUser.id }, { memberTwoId: ctx.dbUser.id }],
          },
        });
        if (!conv) throw new TRPCError({ code: 'FORBIDDEN' });

        return ctx.prisma.message.create({
          data: {
            conversationId: input.conversationId,
            senderId: ctx.dbUser.id,
            content: input.content,
            type: input.type,
            fileUrl: input.fileUrl,
          },
          include: { sender: true },
        });
      }),
  }),
});
