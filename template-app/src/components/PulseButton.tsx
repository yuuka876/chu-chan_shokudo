'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PulseButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function PulseButton({
  children,
  onClick,
  className = '',
}: PulseButtonProps) {
  // パルスアニメーションの定義
  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'loop' as const,
      }
    },
    hover: { 
      scale: 1.15, 
      boxShadow: "0px 0px 8px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.9,
      transition: { duration: 0.1 } 
    }
  };

  return (
    <motion.button
      className={`px-6 py-3 bg-purple-600 text-white rounded-lg ${className}`}
      variants={pulseVariants}
      initial="initial"
      animate="pulse"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
} 