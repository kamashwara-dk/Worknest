import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Workspace selection pages — require auth but no active workspace
export default async function WorkspacesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <>{children}</>;
}
