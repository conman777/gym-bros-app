'use client';

import { useState, useEffect } from 'react';
import { WallpaperConfig, defaultWallpaper, wallpaperPresets } from '@/lib/wallpaper-config';

const STORAGE_KEY = 'gym-bros-wallpaper';

export function useWallpaper() {
  const [wallpaper, setWallpaperState] = useState<WallpaperConfig>(defaultWallpaper);
  const [isLoading, setIsLoading] = useState(true);

  // Load wallpaper from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WallpaperConfig;
        setWallpaperState(parsed);
      }
    } catch (error) {
      console.error('Failed to load wallpaper:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save wallpaper to localStorage
  const setWallpaper = (config: WallpaperConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setWallpaperState(config);
    } catch (error) {
      console.error('Failed to save wallpaper:', error);
      // Handle localStorage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('Image too large. Please upload a smaller image (max 2MB).');
      }
    }
  };

  // Set wallpaper by preset ID
  const setPreset = (presetId: string) => {
    const preset = wallpaperPresets.find((p) => p.id === presetId);
    if (preset) {
      setWallpaper({
        type: preset.type,
        preset: preset.id,
      });
    }
  };

  // Set custom wallpaper from image file
  const setCustomWallpaper = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large. Please upload an image smaller than 2MB.');
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setWallpaper({
          type: 'custom',
          customData: base64,
        });
        resolve(true);
      };
      reader.onerror = () => {
        console.error('Failed to read file');
        resolve(false);
      };
      reader.readAsDataURL(file);
    });
  };

  // Get current wallpaper preset object
  const getCurrentPreset = () => {
    if (wallpaper.type === 'gradient' && wallpaper.preset) {
      return wallpaperPresets.find((p) => p.id === wallpaper.preset);
    }
    return null;
  };

  return {
    wallpaper,
    setWallpaper,
    setPreset,
    setCustomWallpaper,
    getCurrentPreset,
    isLoading,
  };
}
