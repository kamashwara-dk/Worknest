'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { heroContainer, heroGreeting, heroQuote, heroMeta } from '@/lib/animations';

// Curated motivational quotes — professional, not cheesy
const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Small progress is still progress.', author: '' },
  { text: 'Clarity is the antidote to anxiety.', author: '' },
  { text: 'Work smarter, not harder.', author: 'Allan F. Mogensen' },
  { text: 'The best time to start was yesterday. The next best time is now.', author: '' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Your future is created by what you do today.', author: '' },
  { text: 'One task at a time. Done well.', author: '' },
];

function getGreeting(hour: number): string {
  if (hour < 5)  return 'Working late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

interface DashboardHeroProps {
  name?: string | null;
}

export function DashboardHero({ name }: DashboardHeroProps) {
  const hour = new Date().getHours();
  const greeting = getGreeting(hour);
  const firstName = name?.split(' ')[0] ?? '…';

  // Pick a quote deterministically by day-of-year so it doesn't flicker on re-render
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <motion.div
      variants={heroContainer}
      initial="hidden"
      animate="visible"
      className="glass-card rounded-2xl px-6 py-7 relative overflow-hidden"
    >
      {/* Ambient gradient — pointer-events-none so it doesn't block clicks */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(23,133,130,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left — greeting + quote */}
        <div className="space-y-2">
          {/* Greeting line */}
          <motion.h1
            variants={heroGreeting}
            className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight"
            style={{ willChange: 'opacity, transform' }}
          >
            {greeting},{' '}
            <span className="text-[#178582]">{firstName}</span>{' '}
            <span
              role="img"
              aria-label="wave"
              className="inline-block"
              style={{ display: 'inline-block' }}
            >
              👋
            </span>
          </motion.h1>

          {/* Date */}
          <motion.p
            variants={heroMeta}
            className="text-sm text-[#7A9BBF]"
            style={{ willChange: 'opacity' }}
          >
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </motion.p>

          {/* Motivational quote */}
          <motion.div
            variants={heroQuote}
            className="pt-1"
            style={{ willChange: 'opacity, transform' }}
          >
            <p className="text-sm text-zinc-400 italic leading-relaxed max-w-md">
              &ldquo;{quote.text}&rdquo;
              {quote.author && (
                <span className="not-italic text-[#7A9BBF] ml-1">— {quote.author}</span>
              )}
            </p>
          </motion.div>
        </div>

        {/* Right — today's summary pill */}
        <motion.div
          variants={heroMeta}
          className="flex-shrink-0"
          style={{ willChange: 'opacity' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#112540] border border-[#1E3A5F] text-xs text-[#7A9BBF]">
            <span className="w-2 h-2 rounded-full bg-[#178582] animate-pulse" />
            Here&apos;s what&apos;s happening today
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
