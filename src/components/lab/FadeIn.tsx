"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Small client wrapper for the page-load fade/slide-in so server components
// can stay server components while keeping the framer-motion entrance.
export function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
