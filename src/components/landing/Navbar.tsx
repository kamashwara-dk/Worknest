'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Team', href: '#team' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Login', href: '/login' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-[#0A1828]/80 border-b border-[#1E3A5F] shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#178582] to-[#0D5250] flex items-center justify-center shadow-[0_0_16px_rgba(23,133,130,0.4)]">
              <span className="font-display font-bold text-white text-sm">W</span>
            </div>
            <span className="font-display font-bold text-[#E8F0F8] text-lg">
              Work<span className="text-[#178582]">Nest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors duration-200">
                {link.label}
              </Link>
            ))}
            <Link
              href="/register"
              className="shimmer-btn text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(23,133,130,0.4)] hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden backdrop-blur-xl bg-[#0A1828]/90 border-b border-[#1E3A5F]"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-[#B8D0E8] hover:text-[#E8F0F8] transition-colors py-2" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/register" className="shimmer-btn text-white text-sm font-semibold px-5 py-3 rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
