'use client';

import { useUIStore } from '@/store/useUIStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <main
      className={`${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
      } pt-14 min-h-screen transition-all duration-300`}
    >
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </main>
  );
}
