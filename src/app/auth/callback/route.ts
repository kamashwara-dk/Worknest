import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user exists in DB
      const existing = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
      });

      if (!existing) {
        const name = data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User';
        await prisma.user.create({
          data: {
            supabaseId: data.user.id,
            email: data.user.email!,
            name,
            avatar: data.user.user_metadata?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=178582&color=fff&size=128`,
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
