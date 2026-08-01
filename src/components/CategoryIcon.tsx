'use client';

import React from 'react';
import {
  Utensils,
  Coffee,
  Home,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  TrendingUp,
  Banknote,
  HelpCircle,
  Briefcase,
  Store,
  BarChart3,
  Gift,
  Landmark,
  Shield,
  GraduationCap,
  Gamepad2,
  Lightbulb,
  Coins,
  Filter
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  className?: string;
}

/**
 * Strips emoji suffixes/prefixes from category strings.
 */
export function getCleanCategoryName(category: string): string {
  if (!category) return '';
  return category
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Standard emojis
    .replace(/[\u{2600}-\u{27BF}]/gu, '') // Miscellaneous Symbols & Dingbats
    .replace(/[\u{1F000}-\u{1F0FF}]/gu, '')
    .trim();
}

/**
 * Maps a category name to a Lucide icon component.
 */
export function getCategoryIconComponent(category: string) {
  const name = category.toLowerCase();
  
  if (name.includes('ăn uống') || name.includes('eating')) {
    return Utensils;
  }
  if (name.includes('cà phê') || name.includes('cafe')) {
    return Coffee;
  }
  if (name.includes('đi chợ') || name.includes('siêu thị')) {
    return Store;
  }
  if (name.includes('thuê nhà') || name.includes('cho thuê') || name.includes('nhà cửa')) {
    return Home;
  }
  if (name.includes('di chuyển') || name.includes('xăng xe')) {
    return Car;
  }
  if (name.includes('mua sắm') || name.includes('quần áo')) {
    return ShoppingBag;
  }
  if (name.includes('hóa đơn') || name.includes('tiện ích')) {
    return Zap;
  }
  if (name.includes('điện') || name.includes('nước') || name.includes('internet')) {
    return Lightbulb;
  }
  if (name.includes('du lịch') || name.includes('phim')) {
    return Film;
  }
  if (name.includes('giải trí') || name.includes('game')) {
    return Gamepad2;
  }
  if (name.includes('y tế') || name.includes('sức khỏe')) {
    return HeartPulse;
  }
  if (name.includes('đầu tư') || name.includes('tiết kiệm') || name.includes('cổ tức')) {
    return TrendingUp;
  }
  if (name.includes('nợ') || name.includes('lãi suất') || name.includes('trả góp')) {
    if (name.includes('vay') || name.includes('trả góp')) {
      return Landmark;
    }
    return Banknote;
  }
  if (name.includes('lương') || name.includes('thưởng')) {
    return Briefcase;
  }
  if (name.includes('kinh doanh')) {
    return Store;
  }
  if (name.includes('được tặng') || name.includes('quà')) {
    return Gift;
  }
  if (name.includes('bảo hiểm')) {
    return Shield;
  }
  if (name.includes('học') || name.includes('sách')) {
    return GraduationCap;
  }
  if (name.includes('tiền') || name.includes('vàng')) {
    return Coins;
  }
  if (name === 'all') {
    return Filter;
  }
  
  return HelpCircle;
}

export default function CategoryIcon({ category, className = 'w-4 h-4' }: CategoryIconProps) {
  const Icon = getCategoryIconComponent(category);
  return <Icon className={className} />;
}
