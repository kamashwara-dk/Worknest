'use client';

import { motion } from 'framer-motion';
import { routeTransition } from '@/lib/animations';

/**
 * Wraps a page in a fade-and-slide transition.
 * Uses only opacity + transform (translateY) — hardware-accelerated.
 * Drop this around any page component that needs an entrance animation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}
