'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, Building2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { getInitials } from '@/lib/utils';
import type { User } from '@/types';

const departments = [
  'All', 'Engineering', 'Product', 'Design', 'Marketing',
  'Sales', 'HR', 'Finance', 'Operations',
];

const roleColors: Record<string, string> = {
  ADMIN: 'text-red-400 bg-red-400/10 border-red-400/20',
  MANAGER: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  EMPLOYEE: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

export default function TeamPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading } = trpc.users.list.useQuery({
    search: search || undefined,
    department: department || undefined,
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-white">Team Directory</h1>
        <p className="text-zinc-400 text-sm mt-1">{users?.length ?? 0} active members</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartment(dept === 'All' ? '' : dept)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                (dept === 'All' && !department) || department === dept
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-zinc-400 hover:text-white hover:bg-[#112540]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Team grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {users?.map((user) => (
            <motion.div
              key={user.id}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedUser(user as User)}
              className="glass-card rounded-xl p-5 cursor-pointer hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <img
                    src={user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=178582&color=fff&size=64`}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-secondary border-2 border-background" />
                </div>

                <h3 className="font-display font-semibold text-white text-sm mb-0.5">{user.name}</h3>
                <p className="text-zinc-500 text-xs mb-2">{user.designation ?? 'Team Member'}</p>

                <span className={`text-xs px-2 py-0.5 rounded-full border mb-3 ${roleColors[user.role]}`}>
                  {user.role}
                </span>

                {user.department && (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Building2 size={11} />
                    {user.department}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {users?.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-600">
              No team members found
            </div>
          )}
        </motion.div>
      )}

      {/* User detail drawer */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setSelectedUser(null)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm bg-surface border-l border-border h-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={selectedUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=178582&color=fff&size=96`}
                alt={selectedUser.name}
                className="w-24 h-24 rounded-full border-2 border-primary mb-4"
              />
              <h2 className="font-display text-xl font-bold text-white">{selectedUser.name}</h2>
              <p className="text-zinc-400 text-sm">{selectedUser.designation ?? 'Team Member'}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border mt-2 ${roleColors[selectedUser.role]}`}>
                {selectedUser.role}
              </span>
            </div>

            <div className="space-y-4">
              {selectedUser.department && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#112540]">
                  <Building2 size={16} className="text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Department</p>
                    <p className="text-sm text-white">{selectedUser.department}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#112540]">
                <Mail size={16} className="text-zinc-400" />
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="text-sm text-white">{selectedUser.email}</p>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#112540]">
                  <Phone size={16} className="text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Phone</p>
                    <p className="text-sm text-white">{selectedUser.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
