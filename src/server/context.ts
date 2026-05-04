import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export async function createContext(opts: FetchCreateContextFnOptions) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser: User | null = null;

  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });
  }

  return {
    user,
    dbUser,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
