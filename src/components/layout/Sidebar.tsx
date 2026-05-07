'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, MessageSquare, Calendar,
  FileText, Users, Megaphone, BarChart3, User, ChevronLeft,
  ChevronRight, X
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useChatStore } from '@/store/useChatStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { cn } from '@/lib/utils';
import { drawerVariants, sidebarVariants } from '@/lib/animations';
import { trpc } from '@/lib/trpc/client';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Leaves', href: '/leaves', icon: Calendar },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Announcements', href: '/announcements', icon: Megaphone },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Profile', href: '/profile', icon: User },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { unreadCounts } = useChatStore();
  const { unreadCount: notifCount } = useNotificationStore();
  const { data: meData } = trpc.users.me.useQuery();

  const totalUnreadChat = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-border', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-glow-primary">
          <span className="font-display font-bold text-white text-sm">W</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-display font-bold text-white text-lg overflow-hidden whitespace-nowrap"
            >
              Work<span className="text-primary">Nest</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const badge = item.href === '/chat' ? totalUnreadChat :
                        item.href === '/announcements' ? notifCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium overflow-hidden whitespace-nowrap flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badge > 0 && (
                <span className={cn(
                  'flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium',
                  collapsed && 'absolute -top-1 -right-1'
                )}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className={cn('border-t border-border p-3', collapsed && 'flex justify-center')}>
        {meData && (
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="relative flex-shrink-0">
              <img
                src={meData.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(meData.name)}&background=178582&color=fff&size=32`}
                alt={meData.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-background" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-medium text-white truncate max-w-[140px]">{meData.name}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[140px]">{meData.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-surface border-r border-border overflow-hidden"
      >
        <SidebarContent collapsed={sidebarCollapsed} />

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#112540] transition-colors z-50"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-surface border-r border-border"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
