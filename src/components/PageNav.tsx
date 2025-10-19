'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, TrendingUp, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { memo } from 'react'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/stats', icon: TrendingUp, label: 'Stats' },
  { href: '/import', icon: User, label: 'Plans' },
]

function PageNavComponent() {
  const pathname = usePathname()

  return (
    <div className="flex justify-around items-center mt-4 pt-4 border-t border-white/10">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center"
          >
            <motion.div
              className="flex flex-col items-center"
              whileTap={{ scale: 0.9 }}
            >
              <Icon
                size={20}
                className={`mb-1 transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-white/60'
                }`}
              />
              <span
                className={`text-xs transition-all ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-white/60'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeMobileTab"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                />
              )}
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}

export const PageNav = memo(PageNavComponent)
