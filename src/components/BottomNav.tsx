'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/stats', icon: TrendingUp, label: 'Stats' },
  { href: '/friends', icon: Users, label: 'Friends' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 z-50">
      <div className="flex justify-around items-center h-16 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                className="flex flex-col items-center relative py-1"
                whileHover={{
                  scale: 1.2,
                  y: -5,
                  transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                  },
                }}
                whileTap={{
                  scale: 0.9,
                  y: 0,
                }}
              >
                <motion.div
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <Icon
                    size={24}
                    className={`mb-1 transition-colors ${
                      isActive ? 'text-white' : 'text-white/80 hover:text-white'
                    }`}
                  />
                </motion.div>
                <motion.span
                  className={`text-xs transition-all ${
                    isActive ? 'text-white font-medium' : 'text-white/80 hover:text-white'
                  }`}
                  animate={
                    isActive
                      ? {
                          scale: 1.1,
                          fontWeight: 600,
                        }
                      : {
                          scale: 1,
                          fontWeight: 400,
                        }
                  }
                >
                  {item.label}
                </motion.span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  />
                )}
                {/* Hover indicator dot */}
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{
                    opacity: isActive ? 0 : 1,
                    scale: isActive ? 0 : 1,
                    transition: { duration: 0.2 },
                  }}
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
