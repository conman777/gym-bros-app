'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, User, Zap } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedUser, setSelectedUser] = useState<'Conor' | 'Devlin' | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const selectUser = async (userName: 'Conor' | 'Devlin') => {
    setSelectedUser(userName)
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName }),
      })
      
      if (response.ok) {
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    } catch (error) {
      console.error('Failed to select user:', error)
      setLoading(false)
      setSelectedUser(null)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-8"
        >
          <Dumbbell className="w-24 h-24 text-white mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-7xl font-bold text-white mb-4"
        >
          GYM BROS
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/80 text-xl mb-12"
        >
          Choose your profile to continue
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectUser('Conor')}
            disabled={loading}
            className={`relative group bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-8 min-w-[200px] transition-all ${
              selectedUser === 'Conor' ? 'scale-105 border-white/60' : ''
            } ${loading && selectedUser !== 'Conor' ? 'opacity-50' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-full mx-auto mb-4 flex items-center justify-center">
                {loading && selectedUser === 'Conor' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Dumbbell className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">CONOR</h3>
              <div className="flex items-center justify-center gap-1 text-white/60">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Ready to train</span>
              </div>
            </div>

            <AnimatePresence>
              {selectedUser === 'Conor' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -inset-1 border-2 border-white/40 rounded-2xl"
                />
              )}
            </AnimatePresence>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectUser('Devlin')}
            disabled={loading}
            className={`relative group bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-8 min-w-[200px] transition-all ${
              selectedUser === 'Devlin' ? 'scale-105 border-white/60' : ''
            } ${loading && selectedUser !== 'Devlin' ? 'opacity-50' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-dark)] rounded-full mx-auto mb-4 flex items-center justify-center">
                {loading && selectedUser === 'Devlin' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Dumbbell className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">DEVLIN</h3>
              <div className="flex items-center justify-center gap-1 text-white/60">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Ready to train</span>
              </div>
            </div>

            <AnimatePresence>
              {selectedUser === 'Devlin' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -inset-1 border-2 border-white/40 rounded-2xl"
                />
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}