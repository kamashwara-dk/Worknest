import { createTRPCRouter } from '../trpc';
import { tasksRouter } from './tasks';
import { chatRouter } from './chat';
import { leavesRouter } from './leaves';
import { documentsRouter } from './documents';
import { usersRouter } from './users';
import { announcementsRouter } from './announcements';
import { notificationsRouter } from './notifications';
import { analyticsRouter } from './analytics';
import { workspacesRouter } from './workspaces';
import { invitationsRouter } from './invitations';
import { notesRouter } from './notes';
import { feedbackRouter } from './feedback';

export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
  chat: chatRouter,
  leaves: leavesRouter,
  documents: documentsRouter,
  users: usersRouter,
  announcements: announcementsRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
  workspaces: workspacesRouter,
  invitations: invitationsRouter,
  notes: notesRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
