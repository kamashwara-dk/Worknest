'use client';

import { useEffect } from 'react';
import { initAuthListener } from '@/store/useAuthStore';

/**
 * Mounts the Supabase auth listener once at the root.
 * Keeps useAuthStore in sync with the session — login/logout
 * updates the UI instantly without a hard browser refresh.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
