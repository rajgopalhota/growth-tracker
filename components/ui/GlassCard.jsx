'use client';

import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
