'use client';

import { useState, useEffect } from 'react';
import { WallpaperConfig, defaultWallpaper, wallpaperPresets } from '@/lib/wallpaper-config';

const STORAGE_KEY = 'gym-bros-wallpaper';

export function useWallpaper() {
  const [wallpaper, setWallpaperState] = useState<WallpaperConfig>(defaultWallpaper);
  const [isLoading, setIsLoading] = useState(true);

  // Load wallpaper from server on mount (with localStorage fallback)
  useEffect(() => {
    const loadWallpaper = async () => {
      try {
        // Try to fetch from server first
        const response = await fetch('/api/user/wallpaper');
        if (response.ok) {
          const data = await response.json();
          if (data.wallpaper) {
            const serverWallpaper = data.wallpaper as WallpaperConfig;
            setWallpaperState(serverWallpaper);
            // Update localStorage cache
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverWallpaper));
            return;
          }
        }

        // Fall back to localStorage if server fails or returns null
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as WallpaperConfig;
          setWallpaperState(parsed);
        }
      } catch (error) {
        console.error('Failed to load wallpaper from server, using localStorage:', error);
        // Fall back to localStorage on error
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as WallpaperConfig;
            setWallpaperState(parsed);
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadWallpaper();
  }, []);

  // Save wallpaper to server and localStorage
  const setWallpaper = async (config: WallpaperConfig) => {
    try {
      // Save to server first
      const response = await fetch('/api/user/wallpaper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaper: config }),
      });

      if (!response.ok) {
        throw new Error('Failed to save wallpaper to server');
      }

      // Save to localStorage as cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setWallpaperState(config);

      // Dispatch custom event for same-tab updates
      window.dispatchEvent(
        new CustomEvent('wallpaperChange', {
          detail: config,
        })
      );
    } catch (error) {
      console.error('Failed to save wallpaper:', error);
      // Handle localStorage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('Image too large. Please upload a smaller image (max 2MB).');
      } else {
        // Still update state even if server save fails
        setWallpaperState(config);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      }
    }
  };

  // Set wallpaper by preset ID
  const setPreset = async (presetId: string) => {
    const preset = wallpaperPresets.find((p) => p.id === presetId);
    if (preset) {
      await setWallpaper({
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
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await setWallpaper({
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
