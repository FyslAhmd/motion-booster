'use client';

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

type Variant = 'public' | 'admin';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}

const MOTION_BY_VARIANT = {
  public: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const },
    content: {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.18, delay: 0.03, ease: 'easeOut' as const },
    },
  },
  admin: {
    // Keep admin transitions transform-free so fixed overlays stay viewport-centered on mobile.
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
    content: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2, delay: 0.04, ease: 'easeOut' as const },
    },
  },
} as const;

export default function PageTransition({
  children,
  className,
  variant = 'public',
}: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const motionConfig = MOTION_BY_VARIANT[variant];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        initial={motionConfig.initial}
        animate={motionConfig.animate}
        exit={motionConfig.exit}
        transition={motionConfig.transition}
      >
        <motion.div
          className="h-full"
          initial={motionConfig.content.initial}
          animate={motionConfig.content.animate}
          transition={motionConfig.content.transition}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
