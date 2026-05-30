import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, workspaceManagerProcedure } from '../trpc';
import { sendInvitationEmail } from '@/lib/resend';

export const invitationsRouter = createTRPCRouter({
  // ── List pending invitations for the active workspace ────────────────────
  list: workspaceManagerProcedure.query(async ({ ctx }) => {
    return ctx.prisma.invitation.findMany({
      where: { workspaceId: ctx.workspaceId, status: 'PENDING' },
      include: { invitedBy: { select: { name: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // ── Send an invitation email ─────────────────────────────────────────────
  send: workspaceManagerProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already a member
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUser) {
        const alreadyMember = await ctx.prisma.membership.findUnique({
          where: {
            userId_workspaceId: {
              userId: existingUser.id,
              workspaceId: ctx.workspaceId,
            },
          },
        });
        if (alreadyMember) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This user is already a member of the workspace',
          });
        }
      }

      // Upsert invitation (reset token + expiry if re-inviting)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitation = await ctx.prisma.invitation.upsert({
        where: {
          email_workspaceId: { email: input.email, workspaceId: ctx.workspaceId },
        },
        update: {
          status: 'PENDING',
          expiresAt,
          invitedById: ctx.dbUser.id,
        },
        create: {
          email: input.email,
          workspaceId: ctx.workspaceId,
          invitedById: ctx.dbUser.id,
          expiresAt,
        },
        include: { workspace: true },
      });

      // Send email (non-blocking)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      sendInvitationEmail(
        input.email,
        ctx.dbUser.name,
        invitation.workspace.name,
        `${appUrl}/invite/${invitation.token}`
      ).catch(console.error);

      return invitation;
    }),

  // ── Revoke a pending invitation ──────────────────────────────────────────
  revoke: workspaceManagerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const inv = await ctx.prisma.invitation.findUnique({ where: { id: input.id } });
      if (!inv || inv.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return ctx.prisma.invitation.update({
        where: { id: input.id },
        data: { status: 'REVOKED' },
      });
    }),

  // ── Get invitation details by token (public — no workspace header needed) ─
  byToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
        include: {
          workspace: { select: { id: true, name: true, slug: true, logoUrl: true } },
          invitedBy: { select: { name: true, avatar: true } },
        },
      });

      if (!invitation) throw new TRPCError({ code: 'NOT_FOUND' });

      // Mark expired invitations
      if (invitation.expiresAt < new Date() && invitation.status === 'PENDING') {
        await ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' },
        });
        return { ...invitation, status: 'EXPIRED' as const };
      }

      return invitation;
    }),

  // ── Accept an invitation ─────────────────────────────────────────────────
  accept: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
        include: { workspace: true },
      });

      if (!invitation) throw new TRPCError({ code: 'NOT_FOUND' });
      if (invitation.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invitation is ${invitation.status.toLowerCase()}`,
        });
      }
      if (invitation.expiresAt < new Date()) {
        await ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' },
        });
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invitation has expired' });
      }
      if (invitation.email !== ctx.dbUser!.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation was sent to a different email address',
        });
      }

      // Create membership + mark invitation accepted (transaction)
      const [membership] = await ctx.prisma.$transaction([
        ctx.prisma.membership.upsert({
          where: {
            userId_workspaceId: {
              userId: ctx.dbUser!.id,
              workspaceId: invitation.workspaceId,
            },
          },
          update: {},
          create: {
            userId: ctx.dbUser!.id,
            workspaceId: invitation.workspaceId,
            role: 'MEMBER',
          },
        }),
        ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED' },
        }),
      ]);

      return { membership, workspace: invitation.workspace };
    }),
});
