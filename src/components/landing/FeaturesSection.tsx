'use client';

import { motion } from 'framer-motion';
import { CheckSquare, MessageSquare, Calendar, FileText, Users, BarChart3 } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations';

const features = [
  { icon: CheckSquare, title: 'Smart Tasks', description: 'Kanban boards with drag-and-drop, priority levels, assignees, and due dates. Keep every project on track.', color: 'from-[#178582] to-[#0D5250]', glow: 'rgba(23,133,130,0.3)' },
  { icon: MessageSquare, title: 'Real-time Chat', description: 'Instant messaging with channels, file sharing, @mentions, and typing indicators. Stay connected.', color: 'from-[#BFA181] to-[#8C7355]', glow: 'rgba(191,161,129,0.3)' },
  { icon: Calendar, title: 'Leave Management', description: 'Request, approve, and track leaves with calendar views, balance tracking, and email notifications.', color: 'from-[#1EAAA7] to-[#178582]', glow: 'rgba(30,170,167,0.3)' },
  { icon: FileText, title: 'Document Hub', description: 'Rich text editor with auto-save, version history, file attachments, and public/private sharing.', color: 'from-[#D4B896] to-[#BFA181]', glow: 'rgba(212,184,150,0.3)' },
  { icon: Users, title: 'Team Directory', description: 'Browse your team with search, department filters, online status, and detailed profile cards.', color: 'from-[#178582] to-[#126B69]', glow: 'rgba(23,133,130,0.25)' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Real-time insights on task completion, team activity, leave patterns, and productivity trends.', color: 'from-[#BFA181] to-[#D4B896]', glow: 'rgba(191,161,129,0.25)' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-[#0A1828] grid-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#178582]/10 border border-[#178582]/25 text-[#178582] text-sm font-medium mb-6">
            Everything you need
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-[#E8F0F8] mb-4">
            Everything your team needs
          </motion.h2>
          <motion.p variants={fadeUp} className="text-xl text-[#7A9BBF] max-w-2xl mx-auto">
            One platform to replace the chaos of scattered tools. Built for modern teams.
          </motion.p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group relative glass-card rounded-2xl p-6 cursor-default transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 0 1px ${feature.glow}, 0 0 20px ${feature.glow}` }} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#E8F0F8] mb-2">{feature.title}</h3>
              <p className="text-[#7A9BBF] text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
