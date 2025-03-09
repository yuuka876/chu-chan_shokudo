'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function AnimatedButton({
  children,
  onClick,
  className = '',
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={`px-4 py-2 bg-blue-500 text-white rounded-md ${className}`}
      onClick={onClick}
      whileHover={{ 
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 } 
      }}
    >
      {children}
    </motion.button>
  );
} 