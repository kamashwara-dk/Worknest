'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FeedbackSpace } from '@/components/landing/FeedbackSpace';
import { CTASection } from '@/components/landing/CTASection';
import { DeveloperFooter } from '@/components/landing/DeveloperFooter';

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [redirecting] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('code');
    }
    return false;
  });

  // Handle OAuth code landing on root path
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const next = params.get('next') ?? '/dashboard';
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
    }
  }, []);

  useEffect(() => {
    if (redirecting) return;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [redirecting]);

  if (redirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-background">
      {/* Scroll progress bar */}
      <div id="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {/* Analytics preview */}
      <section className="relative py-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
                Analytics
              </div>
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Real-time insights for smarter decisions
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Track task completion rates, team activity patterns, leave distributions, and productivity trends — all in one beautiful dashboard.
              </p>
              <ul className="space-y-3">
                {[
                  'Task completion trend charts',
                  'Team activity heatmaps',
                  'Leave distribution analytics',
                  'Export to CSV in one click',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-secondary text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="glass-card rounded-2xl p-6 blur-[1px] hover:blur-0 transition-all duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-white">Task Completion</h3>
                    <span className="text-secondary text-sm font-medium">+24% this month</span>
                  </div>
                  <div className="h-32 flex items-end gap-1">
                    {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-0.5">
                        <div className="rounded-sm" style={{ height: `${h * 0.6}%`, background: 'rgba(23,133,130,0.3)' }} />
                        <div className="rounded-sm" style={{ height: `${h * 0.4}%`, background: '#178582' }} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Tasks', value: '248', color: 'text-primary' },
                      { label: 'Completed', value: '186', color: 'text-secondary' },
                      { label: 'Rate', value: '75%', color: 'text-accent' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-[#112540] rounded-lg p-3 text-center">
                        <div className={`font-display font-bold text-xl ${stat.color}`}>{stat.value}</div>
                        <div className="text-zinc-500 text-xs mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feedback Space — replaces mock testimonials */}
      <FeedbackSpace />

      <CTASection />
      <DeveloperFooter />
    </main>
  );
}
