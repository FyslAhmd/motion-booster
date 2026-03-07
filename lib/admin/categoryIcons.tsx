// Shared icon renderer for service categories — used in both public + admin

import {
  TrendingUp, Palette, Code, Globe, Smartphone, Layers, Sparkles,
  Video, Briefcase, Zap, Star, Rocket, Shield, Settings, LayoutGrid,
  ShoppingBag, Camera, Headphones, BookOpen, Award,
} from 'lucide-react';
import React from 'react';

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'trending-up': TrendingUp,
  'palette':     Palette,
  'code':        Code,
  'globe':       Globe,
  'smartphone':  Smartphone,
  'layers':      Layers,
  'sparkles':    Sparkles,
  'video':       Video,
  'briefcase':   Briefcase,
  'zap':         Zap,
  'star':        Star,
  'rocket':      Rocket,
  'shield':      Shield,
  'settings':    Settings,
  'layout-grid': LayoutGrid,
  'shopping-bag':ShoppingBag,
  'camera':      Camera,
  'headphones':  Headphones,
  'book-open':   BookOpen,
  'award':       Award,
};

export const ICON_OPTIONS = Object.keys(CATEGORY_ICONS);

export function CategoryIcon({ iconType, className }: { iconType: string; className?: string }) {
  // If it's a custom uploaded image (base64 or URL)
  if (iconType && (iconType.startsWith('data:') || iconType.startsWith('http') || iconType.startsWith('/'))) {
    // Extract size from className like "w-6 h-6"
    const sizeMatch = className?.match(/w-(\d+)/);
    const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 24;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconType}
        alt="custom icon"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain"
      />
    );
  }
  const Icon = CATEGORY_ICONS[iconType] ?? Layers;
  return <Icon className={className} />;
}
