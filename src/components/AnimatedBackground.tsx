'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function AnimatedBackground() {
  const [circles, setCircles] = useState<
    Array<{
      id: number;
      width: number;
      height: number;
      left: string;
      top: string;
      x: number;
      y: number;
      duration: number;
    }>
  >([]);

  // Generate circles only on client side to avoid hydration mismatch
  useEffect(() => {
    setCircles(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        width: Math.random() * 300 + 100,
        height: Math.random() * 300 + 100,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        duration: Math.random() * 20 + 10,
      }))
    );
  }, []);

  // Don't render circles until client-side mount
  if (circles.length === 0) {
    return <div className="absolute inset-0 pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full bg-white/5"
          style={{
            width: circle.width,
            height: circle.height,
            left: circle.left,
            top: circle.top,
          }}
          animate={{
            x: [0, circle.x],
            y: [0, circle.y],
          }}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
