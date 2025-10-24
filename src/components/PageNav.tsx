'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, TrendingUp, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { memo } from 'react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/stats', icon: TrendingUp, label: 'Stats' },
  { href: '/friends', icon: Users, label: 'Friends' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

function PageNavComponent() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} className="relative flex items-center gap-2">
            <motion.div className="flex items-center gap-2" whileTap={{ scale: 0.9 }}>
              <Icon
                size={20}
                className={`transition-colors ${isActive ? 'text-white' : 'text-white/80'}`}
              />
              <span
                className={`text-sm transition-all ${
                  isActive ? 'text-white font-medium' : 'text-white/80'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeMobileTab"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

export const PageNav = memo(PageNavComponent);
