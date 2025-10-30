/**
 * CN Utility Function
 *
 * Combines class names using clsx and tailwind-merge
 * This is a utility for combining CSS classes efficiently
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs - Class values to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
