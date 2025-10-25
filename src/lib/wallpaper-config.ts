export type WallpaperType = 'gradient' | 'custom' | 'solid';

export interface WallpaperConfig {
  type: WallpaperType;
  preset?: string;
  customUrl?: string;
  customData?: string; // base64 for localStorage
}

export interface WallpaperPreset {
  id: string;
  name: string;
  type: WallpaperType;
  gradient?: string;
  solidColor?: string;
  preview: string; // Tailwind classes for preview
}

export const wallpaperPresets: WallpaperPreset[] = [
  {
    id: 'default',
    name: 'Default',
    type: 'gradient',
    gradient: 'from-blue-900 via-purple-900 to-pink-900',
    preview: 'bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'gradient',
    gradient: 'from-green-400 via-blue-500 to-purple-600',
    preview: 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    type: 'gradient',
    gradient: 'from-orange-500 via-pink-500 to-purple-600',
    preview: 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'gradient',
    gradient: 'from-blue-600 via-cyan-500 to-teal-400',
    preview: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400',
  },
  {
    id: 'forest',
    name: 'Forest',
    type: 'gradient',
    gradient: 'from-green-700 via-emerald-600 to-teal-500',
    preview: 'bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    type: 'gradient',
    gradient: 'from-indigo-900 via-purple-900 to-slate-900',
    preview: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900',
  },
  {
    id: 'dark',
    name: 'Dark',
    type: 'solid',
    solidColor: '#1a1a1a',
    preview: 'bg-[#1a1a1a]',
  },
  {
    id: 'slate',
    name: 'Slate',
    type: 'solid',
    solidColor: '#334155',
    preview: 'bg-slate-700',
  },
];

export const defaultWallpaper: WallpaperConfig = {
  type: 'gradient',
  preset: 'default',
};
