import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { type Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// ─── Auth middleware ──────────────────────────────────────────────────────────
// Ensures a Supabase session exists and auto-provisions the DB user record.

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  let dbUser = ctx.dbUser;
  if (!dbUser) {
    const name =
      ctx.user.user_metadata?.full_name ??
      ctx.user.email?.split('@')[0] ??
      'User';
    dbUser = await ctx.prisma.user.create({
      data: {
        supabaseId: ctx.user.id,
        email: ctx.user.email!,
        name,
        avatar:
          ctx.user.user_metadata?.avatar_url ??
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=178582&color=fff&size=128`,
      },
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user, dbUser } });
});

// ─── Workspace middleware ─────────────────────────────────────────────────────
// Ensures the user is an active member of the workspace in the request header.

const enforceWorkspaceMember = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (!ctx.dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (!ctx.workspaceId || !ctx.dbMembership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No active workspace. Select a workspace first.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      dbUser: ctx.dbUser,
      workspaceId: ctx.workspaceId,
      dbMembership: ctx.dbMembership,
    },
  });
});

const enforceWorkspaceManager = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser || !ctx.workspaceId || !ctx.dbMembership) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  const role = ctx.dbMembership.role;
  if (role !== 'MANAGER' && role !== 'ADMIN' && role !== 'OWNER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      dbUser: ctx.dbUser,
      workspaceId: ctx.workspaceId,
      dbMembership: ctx.dbMembership,
    },
  });
});

const enforceWorkspaceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser || !ctx.workspaceId || !ctx.dbMembership) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  const role = ctx.dbMembership.role;
  if (role !== 'ADMIN' && role !== 'OWNER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      dbUser: ctx.dbUser,
      workspaceId: ctx.workspaceId,
      dbMembership: ctx.dbMembership,
    },
  });
});

// ─── Legacy global-role middleware (kept for backward compat) ─────────────────

const enforceUserIsManager = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (ctx.dbUser.role !== 'MANAGER' && ctx.dbUser.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager or Admin access required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user, dbUser: ctx.dbUser } });
});

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (ctx.dbUser.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user, dbUser: ctx.dbUser } });
});

// ─── Exported procedures ──────────────────────────────────────────────────────

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const managerProcedure   = t.procedure.use(enforceUserIsAuthed).use(enforceUserIsManager);
export const adminProcedure     = t.procedure.use(enforceUserIsAuthed).use(enforceUserIsAdmin);

// Workspace-scoped procedures (require x-workspace-id header + membership)
export const workspaceProcedure        = t.procedure.use(enforceUserIsAuthed).use(enforceWorkspaceMember);
export const workspaceManagerProcedure = t.procedure.use(enforceUserIsAuthed).use(enforceWorkspaceMember).use(enforceWorkspaceManager);
export const workspaceAdminProcedure   = t.procedure.use(enforceUserIsAuthed).use(enforceWorkspaceMember).use(enforceWorkspaceAdmin);
