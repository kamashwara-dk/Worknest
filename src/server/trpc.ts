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

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
      dbUser: ctx.dbUser,
    },
  });
});

const enforceUserIsManager = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if (ctx.dbUser.role !== 'MANAGER' && ctx.dbUser.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager or Admin access required' });
  }
  return next({
    ctx: {
      user: ctx.user,
      dbUser: ctx.dbUser,
    },
  });
});

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if (ctx.dbUser.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({
    ctx: {
      user: ctx.user,
      dbUser: ctx.dbUser,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const managerProcedure = t.procedure.use(enforceUserIsManager);
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
