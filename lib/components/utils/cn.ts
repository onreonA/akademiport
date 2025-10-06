// =====================================================
// CLASSNAME UTILITY
// =====================================================
// Tailwind CSS class'larını birleştirmek için utility
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/**
 * Class'ları birleştir ve çakışmaları çöz
 * clsx ile twMerge'ı birleştirir
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
