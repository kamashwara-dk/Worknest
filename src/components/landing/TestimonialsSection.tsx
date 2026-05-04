'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations';

const companies = [
  'Acme Corp', 'TechFlow', 'BuildCo', 'DataSync', 'CloudBase',
  'NexGen', 'Pivotal', 'Streamline', 'Catalyst', 'Vertex',
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Engineering Manager at TechFlow',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=178582&color=fff&size=64',
    quote: 'WorkNest replaced four different tools for us. Our team\'s productivity jumped 40% in the first month. The Kanban board alone is worth it.',
    stars: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Operations at BuildCo',
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Johnson&background=BFA181&color=fff&size=64',
    quote: 'Leave management used to be a nightmare. Now approvals happen in seconds and everyone can see their balance. Game changer for HR.',
    stars: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Product Lead at DataSync',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=F59E0B&color=fff&size=64',
    quote: 'The real-time chat with file sharing means we\'ve cut email by 80%. The analytics dashboard gives me exactly the insights I need.',
    stars: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company ticker */}
        <div className="mb-16 overflow-hidden">
          <p className="text-center text-zinc-500 text-sm mb-6 uppercase tracking-widest">
            Trusted by teams at
          </p>
          <div className="relative">
            <div className="flex animate-ticker whitespace-nowrap">
              {[...companies, ...companies].map((company, i) => (
                <div
                  key={`${company}-${i}`}
                  className="inline-flex items-center mx-8 text-zinc-500 font-display font-semibold text-lg hover:text-zinc-300 transition-colors"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl font-bold text-white mb-4"
          >
            Loved by teams everywhere
          </motion.h2>
          <motion.p variants={fadeUp} className="text-zinc-400 text-lg">
            Don&apos;t take our word for it.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="glass-card rounded-2xl p-6 relative"
            >
              <Quote size={32} className="text-primary/20 absolute top-4 right-4" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={14} className="text-accent fill-accent" />
                ))}
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-zinc-500 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
