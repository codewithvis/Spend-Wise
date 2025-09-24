import {
  ShoppingCart,
  Utensils,
  Car,
  Film,
  Zap,
  Home,
  Landmark,
  ShoppingBag,
  Plane,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/lib/types';

export const CATEGORIES: Category[] = [
  'Groceries',
  'Dining',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Rent',
  'Salary',
  'Shopping',
  'Travel',
  'Other',
];

export const CATEGORY_ICONS: { [key in Category]: LucideIcon } = {
  Groceries: ShoppingCart,
  Dining: Utensils,
  Transportation: Car,
  Entertainment: Film,
  Utilities: Zap,
  Rent: Home,
  Salary: Landmark,
  Shopping: ShoppingBag,
  Travel: Plane,
  Other: MoreHorizontal,
};
