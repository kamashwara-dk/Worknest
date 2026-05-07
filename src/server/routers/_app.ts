import { createTRPCRouter } from '../trpc';
import { tasksRouter } from './tasks';
import { chatRouter } from './chat';
import { leavesRouter } from './leaves';
import { documentsRouter } from './documents';
import { usersRouter } from './users';
import { announcementsRouter } from './announcements';
import { notificationsRouter } from './notifications';
import { analyticsRouter } from './analytics';

export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
  chat: chatRouter,
  leaves: leavesRouter,
  documents: documentsRouter,
  users: usersRouter,
  announcements: announcementsRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
