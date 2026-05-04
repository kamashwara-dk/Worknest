'use client';

import { useEffect } from 'react';
import { Bell, Menu, Search, LogOut, User } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { trpc } from '@/lib/trpc/client';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useNotificationsRealtime } from '@/hooks/useNotifications';

export function Topbar() {
  const { setSidebarOpen, setNotificationPanelOpen, setCommandPaletteOpen, sidebarCollapsed } = useUIStore();
  const { unreadCount, setNotifications, setUnreadCount } = useNotificationStore();
  const router = useRouter();

  const { data: notifData } = trpc.notifications.list.useQuery({ limit: 20 });
  const { data: meData } = trpc.users.me.useQuery();

  useNotificationsRealtime(meData?.id ?? null);

  useEffect(() => {
    if (notifData) {
      setNotifications(notifData.notifications as Parameters<typeof setNotifications>[0]);
      setUnreadCount(notifData.unreadCount);
    }
  }, [notifData, setNotifications, setUnreadCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/login');
    router.refresh();
  };

  const leftOffset = sidebarCollapsed ? 'lg:left-16' : 'lg:left-60';

  return (
    <header className={`fixed top-0 right-0 left-0 ${leftOffset} z-30 h-14 bg-[#0D1F35]/95 backdrop-blur-xl border-b border-[#1E3A5F] flex items-center px-4 gap-3 transition-all duration-300`}>
      {/* Mobile hamburger */}
      <button className="lg:hidden text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Search bar */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#112540] border border-[#1E3A5F] text-[#7A9BBF] hover:text-[#E8F0F8] hover:border-[#178582]/50 transition-all duration-200 text-sm flex-1 max-w-xs"
      >
        <Search size={14} />
        <span>Search...</span>
        <kbd className="ml-auto text-xs bg-[#152B4A] px-1.5 py-0.5 rounded border border-[#1E3A5F] hidden sm:block">⌘K</kbd>
      </button>

      <div className="flex-1" />

      {/* Notification bell */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setNotificationPanelOpen(true)}
        className="relative p-2 text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors rounded-lg hover:bg-[#178582]/10"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#178582] text-white text-[10px] flex items-center justify-center font-medium px-0.5"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* User dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#178582]/10 transition-colors">
          <img
            src={meData?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(meData?.name ?? 'User')}&background=178582&color=fff&size=32`}
            alt={meData?.name ?? 'User'}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#178582]/50 transition-all"
          />
        </button>

        <div className="absolute right-0 top-full mt-2 w-52 bg-[#112540] border border-[#1E3A5F] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b border-[#1E3A5F]">
            <p className="text-sm font-semibold text-[#E8F0F8] truncate">{meData?.name ?? 'Loading...'}</p>
            <p className="text-xs text-[#7A9BBF] truncate">{meData?.email}</p>
            {meData?.role && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-[#178582]/10 text-[#178582] border border-[#178582]/20">
                {meData.role}
              </span>
            )}
          </div>
          <div className="p-1">
            <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-[#B8D0E8] hover:text-[#E8F0F8] hover:bg-[#178582]/10 rounded-lg transition-colors">
              <User size={14} />
              Profile
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-lg transition-colors">
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
