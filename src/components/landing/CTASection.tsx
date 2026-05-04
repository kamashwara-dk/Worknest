'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations';
import Link from 'next/link';

export function CTASection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0D5250 0%, #178582 40%, #126B69 70%, #0D5250 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
        }} />
        <div className="absolute inset-0 grid-texture opacity-20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#BFA181]/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-black/20 blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to transform your workday?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/80 text-xl mb-10">
            Join 500+ teams already using WorkNest to get more done.
          </motion.p>

          {!submitted ? (
            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                  required
                />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#BFA181] text-[#0A1828] font-semibold rounded-xl hover:bg-[#D4B896] transition-all duration-200 hover:scale-105 whitespace-nowrap">
                Get early access <ArrowRight size={16} />
              </button>
            </motion.form>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white">
              <span className="text-[#BFA181]">✓</span>
              You&apos;re on the list! We&apos;ll be in touch soon.
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/register" className="text-white/70 hover:text-white text-sm underline underline-offset-4 transition-colors">
              Or create your account now →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
