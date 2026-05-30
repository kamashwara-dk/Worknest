import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Always call getUser() — refreshes the session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Route classification ──────────────────────────────────────────────────

  // Workspace-scoped app routes: /w/[slug]/...
  const isWorkspaceRoute = pathname.startsWith('/w/');

  // Workspace management routes (picker, create)
  const isWorkspaceManagementRoute =
    pathname.startsWith('/workspaces') || pathname.startsWith('/notes');

  // Legacy app routes (profile is workspace-agnostic)
  const isProfileRoute = pathname.startsWith('/profile');

  // Auth pages
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Public routes — always accessible
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/invite/');

  // ── Guards ────────────────────────────────────────────────────────────────

  if (isPublicRoute) return supabaseResponse;

  // All protected routes require auth
  if (
    (isWorkspaceRoute || isWorkspaceManagementRoute || isProfileRoute) &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/workspaces';
    return NextResponse.redirect(url);
  }

  // Redirect root dashboard/app paths to workspace picker
  const isLegacyAppRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/leaves') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/team') ||
    pathname.startsWith('/announcements') ||
    pathname.startsWith('/analytics');

  if (isLegacyAppRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/workspaces';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
