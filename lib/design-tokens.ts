/**
 * Design Tokens - Utility Functions
 *
 * Bu dosya, design-system.ts'i Tailwind CSS class'ları olarak kullanmayı kolaylaştırır.
 * Hardcoded class'lar yerine, bu helper fonksiyonları kullanarak tutarlı tasarım sağlayın.
 *
 * @example
 * import { tokens, color, spacing } from '@/lib/design-tokens';
 *
 * <button className={tokens.button.primary}>Kaydet</button>
 * <div className={color('primary', 600, 'bg')}>Mavi arkaplan</div>
 */

import { designSystem } from './design-system';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes
 * Prevents class conflicts and ensures proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Color Helper - Generate Tailwind color classes
 * @param palette - Color palette name (primary, secondary, success, warning, error)
 * @param shade - Color shade (50-900)
 * @param type - Type of color class (bg, text, border)
 * @returns Tailwind color class string
 *
 * @example
 * color('primary', 600, 'bg') // 'bg-blue-600'
 * color('success', 500, 'text') // 'text-green-500'
 */
export function color(
  palette: 'primary' | 'secondary' | 'success' | 'warning' | 'error',
  shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  type: 'bg' | 'text' | 'border' = 'bg'
): string {
  const colorMap = {
    primary: 'blue',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    error: 'red',
  };

  return `${type}-${colorMap[palette]}-${shade}`;
}

/**
 * Spacing Helper - Generate Tailwind spacing classes
 * @param size - Spacing size (0-64)
 * @param type - Type of spacing (p, m, gap, space-x, space-y)
 * @param side - Side for padding/margin (t, r, b, l, x, y, or empty for all sides)
 * @returns Tailwind spacing class string
 *
 * @example
 * spacing(4, 'p') // 'p-4'
 * spacing(6, 'm', 'x') // 'mx-6'
 * spacing(8, 'gap') // 'gap-8'
 */
export function spacing(
  size:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 8
    | 10
    | 12
    | 16
    | 20
    | 24
    | 32
    | 40
    | 48
    | 56
    | 64,
  type: 'p' | 'm' | 'gap' | 'space-x' | 'space-y' = 'p',
  side?: 't' | 'r' | 'b' | 'l' | 'x' | 'y'
): string {
  if (type === 'gap' || type === 'space-x' || type === 'space-y') {
    return `${type}-${size}`;
  }

  return side ? `${type}${side}-${size}` : `${type}-${size}`;
}

/**
 * Typography Helper - Generate Tailwind typography classes
 * @param variant - Typography variant
 * @returns Tailwind typography class string
 *
 * @example
 * typography('heading1') // 'text-4xl font-bold text-gray-900'
 * typography('body') // 'text-base text-gray-600'
 */
export function typography(
  variant:
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'heading4'
    | 'body'
    | 'bodyLarge'
    | 'bodySmall'
    | 'caption'
): string {
  const variants = {
    heading1: 'text-4xl md:text-5xl font-bold text-gray-900',
    heading2: 'text-3xl md:text-4xl font-bold text-gray-900',
    heading3: 'text-2xl md:text-3xl font-semibold text-gray-900',
    heading4: 'text-xl md:text-2xl font-semibold text-gray-900',
    body: 'text-base text-gray-600 leading-relaxed',
    bodyLarge: 'text-lg text-gray-600 leading-relaxed',
    bodySmall: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
  };

  return variants[variant];
}

/**
 * Shadow Helper - Generate Tailwind shadow classes
 * @param size - Shadow size
 * @returns Tailwind shadow class string
 *
 * @example
 * shadow('lg') // 'shadow-lg'
 */
export function shadow(
  size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none' = 'md'
): string {
  return size === 'none' ? 'shadow-none' : `shadow-${size}`;
}

/**
 * Border Radius Helper - Generate Tailwind border radius classes
 * @param size - Border radius size
 * @returns Tailwind border radius class string
 *
 * @example
 * radius('lg') // 'rounded-lg'
 */
export function radius(
  size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' = 'md'
): string {
  return `rounded-${size}`;
}

/**
 * Pre-composed Design Tokens
 * Ready-to-use class combinations for common patterns
 */
export const tokens = {
  // Button variants
  button: {
    primary: cn(
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'hover:from-blue-600 hover:to-blue-700',
      'text-white font-medium',
      'px-6 py-2 rounded-lg',
      'transition-all duration-200',
      'shadow-lg hover:shadow-xl',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    secondary: cn(
      'bg-white border border-gray-300',
      'hover:bg-gray-50',
      'text-gray-700 font-medium',
      'px-6 py-2 rounded-lg',
      'transition-colors duration-200'
    ),
    success: cn(
      'bg-gradient-to-r from-green-500 to-green-600',
      'hover:from-green-600 hover:to-green-700',
      'text-white font-medium',
      'px-6 py-2 rounded-lg',
      'transition-all duration-200',
      'shadow-lg hover:shadow-xl'
    ),
    danger: cn(
      'bg-gradient-to-r from-red-500 to-red-600',
      'hover:from-red-600 hover:to-red-700',
      'text-white font-medium',
      'px-6 py-2 rounded-lg',
      'transition-all duration-200',
      'shadow-lg hover:shadow-xl'
    ),
    ghost: cn(
      'text-gray-600 hover:text-gray-800',
      'hover:bg-gray-100',
      'px-4 py-2 rounded-lg',
      'transition-colors duration-200'
    ),
  },

  // Card variants
  card: {
    base: cn(
      'bg-white rounded-xl',
      'border border-gray-200',
      'shadow-sm hover:shadow-md',
      'transition-shadow duration-200',
      'p-6'
    ),
    elevated: cn(
      'bg-white rounded-xl',
      'shadow-lg hover:shadow-xl',
      'transition-shadow duration-200',
      'p-6'
    ),
    flat: cn('bg-gray-50 rounded-lg', 'border border-gray-200', 'p-4'),
    glass: cn(
      'bg-white/80 backdrop-blur-sm rounded-xl',
      'border border-white/20',
      'shadow-lg',
      'p-6'
    ),
  },

  // Input variants
  input: {
    base: cn(
      'w-full px-3 py-2',
      'border border-gray-300 rounded-lg',
      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      'transition-colors duration-200',
      'disabled:bg-gray-100 disabled:cursor-not-allowed'
    ),
    error: cn(
      'w-full px-3 py-2',
      'border border-red-300 rounded-lg',
      'focus:ring-2 focus:ring-red-500 focus:border-red-500',
      'transition-colors duration-200'
    ),
  },

  // Typography variants
  typography: {
    heading1: typography('heading1'),
    heading2: typography('heading2'),
    heading3: typography('heading3'),
    heading4: typography('heading4'),
    body: typography('body'),
    bodyLarge: typography('bodyLarge'),
    bodySmall: typography('bodySmall'),
    caption: typography('caption'),
  },

  // Badge variants
  badge: {
    primary: cn(
      'px-3 py-1 rounded-full text-sm font-medium',
      'bg-blue-100 text-blue-800'
    ),
    success: cn(
      'px-3 py-1 rounded-full text-sm font-medium',
      'bg-green-100 text-green-800'
    ),
    warning: cn(
      'px-3 py-1 rounded-full text-sm font-medium',
      'bg-yellow-100 text-yellow-800'
    ),
    danger: cn(
      'px-3 py-1 rounded-full text-sm font-medium',
      'bg-red-100 text-red-800'
    ),
    neutral: cn(
      'px-3 py-1 rounded-full text-sm font-medium',
      'bg-gray-100 text-gray-800'
    ),
  },

  // Layout helpers
  layout: {
    container: cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'),
    section: cn('py-16 md:py-24'),
    grid: {
      cols1: 'grid grid-cols-1 gap-6',
      cols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
      cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    },
  },

  // Gradient backgrounds
  gradient: {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
    hero: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
  },
};

/**
 * Responsive Helper - Generate responsive utility classes
 * @param base - Base class
 * @param sm - Small screen class
 * @param md - Medium screen class
 * @param lg - Large screen class
 * @returns Combined responsive class string
 *
 * @example
 * responsive('text-sm', 'text-base', 'text-lg', 'text-xl')
 * // 'text-sm sm:text-base md:text-lg lg:text-xl'
 */
export function responsive(
  base: string,
  sm?: string,
  md?: string,
  lg?: string
): string {
  const classes = [base];
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  return classes.join(' ');
}

// Export design system for direct access if needed
export { designSystem };
