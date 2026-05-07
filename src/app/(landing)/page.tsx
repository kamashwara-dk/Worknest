'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import Link from 'next/link';

const GithubIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

function Footer() {
  const columns = [
    { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
    { title: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Support'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'] },
  ];

  return (
    <footer className="bg-surface border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">W</span>
              </div>
              <span className="font-display font-bold text-white text-lg">
                ork<span className="text-primary">Nest</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Your team&apos;s daily command center.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><TwitterIcon /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><GithubIcon /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><LinkedinIcon /></a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-white text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">© 2026 WorkNest. All rights reserved.</p>
          <p className="text-zinc-600 text-sm">Built with ❤️ for productive teams</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // If Supabase redirected back here with an OAuth code (misconfigured redirect URL),
    // forward it to the proper callback route so the session can be established.
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setRedirecting(true);
      const next = params.get('next') ?? '/dashboard';
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
      return;
    }
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="bg-background">
      <div id="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />

      {/* Analytics preview section */}
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
              className="relative"
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

      <CTASection />
      <Footer />
    </main>
  );
}
