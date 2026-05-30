import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { User, Membership } from '@prisma/client';

export async function createContext(req?: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser: User | null = null;
  let dbMembership: Membership | null = null;
  let workspaceId: string | null = null;

  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    // Resolve active workspace from the request header sent by the tRPC client
    const wsId = req?.headers.get('x-workspace-id') ?? null;
    if (wsId && dbUser) {
      dbMembership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: { userId: dbUser.id, workspaceId: wsId },
        },
      });
      if (dbMembership) {
        workspaceId = wsId;
      }
    }
  }

  return {
    user,
    dbUser,
    dbMembership,
    workspaceId,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
