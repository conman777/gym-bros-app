'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { WallpaperConfig, wallpaperPresets, defaultWallpaper } from '@/lib/wallpaper-config';

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
  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(defaultWallpaper);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wallpaper from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gym-bros-wallpaper');
      if (stored) {
        const parsed = JSON.parse(stored) as WallpaperConfig;
        setWallpaper(parsed);
      }
    } catch (error) {
      console.error('Failed to load wallpaper:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen for wallpaper changes (from settings page)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gym-bros-wallpaper' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as WallpaperConfig;
          setWallpaper(parsed);
        } catch (error) {
          console.error('Failed to parse wallpaper update:', error);
        }
      }
    };

    // Also listen for custom event (for same-tab updates)
    const handleWallpaperChange = (e: CustomEvent<WallpaperConfig>) => {
      setWallpaper(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wallpaperChange' as any, handleWallpaperChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wallpaperChange' as any, handleWallpaperChange);
    };
  }, []);

  // Generate animated circles for gradient backgrounds
  useEffect(() => {
    if (wallpaper.type === 'gradient') {
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
    }
  }, [wallpaper.type]);

  // Get gradient class for current preset
  const getGradientClass = () => {
    if (wallpaper.type === 'gradient' && wallpaper.preset) {
      const preset = wallpaperPresets.find((p) => p.id === wallpaper.preset);
      return preset?.gradient || 'from-blue-900 via-purple-900 to-pink-900';
    }
    return 'from-blue-900 via-purple-900 to-pink-900';
  };

  // Get solid color for solid backgrounds
  const getSolidColor = () => {
    if (wallpaper.type === 'solid' && wallpaper.preset) {
      const preset = wallpaperPresets.find((p) => p.id === wallpaper.preset);
      return preset?.solidColor || '#1a1a1a';
    }
    return '#1a1a1a';
  };

  // Don't render until wallpaper is loaded from localStorage
  if (!isLoaded) {
    return null;
  }

  // Render custom image background
  if (wallpaper.type === 'custom' && (wallpaper.customData || wallpaper.customUrl)) {
    return (
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url(${wallpaper.customData || wallpaper.customUrl})`,
        }}
      >
        {/* Overlay to maintain glass effect visibility */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
    );
  }

  // Render solid color background
  if (wallpaper.type === 'solid') {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: getSolidColor(),
        }}
      />
    );
  }

  // Render animated gradient background (default)
  const gradientClass = `absolute inset-0 bg-gradient-to-br ${getGradientClass()}`;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className={gradientClass} />
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
