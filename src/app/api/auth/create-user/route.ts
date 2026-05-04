import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { supabaseId, email, name, department } = await req.json();

    if (!supabaseId || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { supabaseId } });
    if (existing) {
      return NextResponse.json({ user: existing });
    }

    const user = await prisma.user.create({
      data: {
        supabaseId,
        email,
        name,
        department: department || null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=178582&color=fff&size=128`,
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(console.error);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
