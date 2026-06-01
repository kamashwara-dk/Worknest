'use client';

import { motion } from 'framer-motion';

/**
 * Full-screen loading overlay.
 * Uses only transform + opacity — fully hardware-accelerated.
 * No bounce physics. Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94).
 */
export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A1828]"
      aria-label="Loading"
      role="status"
    >
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-8"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#178582] to-[#0D5250] flex items-center justify-center shadow-[0_0_32px_rgba(23,133,130,0.4)]">
          <span className="font-display font-bold text-white text-2xl">W</span>
        </div>
      </motion.div>

      {/* Segmented arc spinner — pure CSS, hardware-accelerated */}
      <div className="relative w-10 h-10 mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#178582]"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-[3px] rounded-full border border-[#1E3A5F]" />
      </div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-sm text-[#7A9BBF] tracking-wide"
      >
        {label}
      </motion.p>

      {/* Subtle pulse dots */}
      <div className="flex items-center gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: [0.4, 0, 0.6, 1],
            }}
            className="w-1.5 h-1.5 rounded-full bg-[#178582]"
            style={{ willChange: 'opacity' }}
          />
        ))}
      </div>
    </motion.div>
  );
}
