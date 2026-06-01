'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

/**
 * Call once at the root layout level.
 * Subscribes to Supabase auth state changes and keeps the Zustand store
 * in sync — no hard refresh needed on login/logout.
 */
export function initAuthListener() {
  const supabase = createClient();

  // Hydrate immediately
  supabase.auth.getUser().then(({ data }) => {
    useAuthStore.getState().setUser(data.user ?? null);
  });

  // Subscribe to future changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}
