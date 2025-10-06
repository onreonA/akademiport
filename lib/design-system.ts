// IA-6 Design System
// İhracat Akademi web sitesi referans alınarak oluşturulmuş tasarım standartları
export const designSystem = {
  colors: {
    // İhracat Akademi'den çıkarılan mavi tonları
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // İhracat Akademi ana mavi
      600: '#2563eb', // İhracat Akademi koyu mavi
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // İhracat Akademi'den çıkarılan gri tonları
    secondary: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280', // İhracat Akademi orta gri
      600: '#4b5563',
      700: '#374151', // İhracat Akademi koyu gri
      800: '#1f2937',
      900: '#111827',
    },
    // İhracat Akademi'den çıkarılan yeşil tonları (başarı göstergeleri)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // İhracat Akademi yeşil
      600: '#16a34a', // İhracat Akademi koyu yeşil
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    // İhracat Akademi'den çıkarılan sarı tonları (uyarı göstergeleri)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // İhracat Akademi sarı
      600: '#d97706', // İhracat Akademi koyu sarı
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // İhracat Akademi'den çıkarılan kırmızı tonları (hata göstergeleri)
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // İhracat Akademi kırmızı
      600: '#dc2626', // İhracat Akademi koyu kırmızı
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // İhracat Akademi'den çıkarılan gradient'ler
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      secondary: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      button: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      glass:
        'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      hero: 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)', // İhracat Akademi hero gradient
      section: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)', // İhracat Akademi section gradient
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  components: {
    // İhracat Akademi'den çıkarılan buton stilleri
    button: {
      base: 'inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200',
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md',
      secondary:
        'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-sm hover:shadow-md',
      success:
        'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-sm hover:shadow-md',
      warning:
        'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-sm hover:shadow-md',
      error:
        'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-sm hover:shadow-md',
      outline:
        'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 bg-white',
      ghost:
        'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500 bg-transparent',
      gradient:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl',
    },
    // İhracat Akademi'den çıkarılan kart stilleri
    card: {
      base: 'bg-white rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-shadow duration-200',
      elevated:
        'bg-white rounded-xl shadow-lg border border-secondary-200 hover:shadow-xl transition-shadow duration-200',
      flat: 'bg-white rounded-xl border border-secondary-200',
      glass:
        'bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 hover:bg-white/90 transition-all duration-200',
      gradient:
        'bg-gradient-to-br from-white to-secondary-50 rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-shadow duration-200',
    },
    // İhracat Akademi'den çıkarılan input stilleri
    input: {
      base: 'block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200',
      error:
        'block w-full px-4 py-3 border border-error-300 rounded-lg shadow-sm placeholder-error-400 focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-error-500 sm:text-sm transition-colors duration-200',
      glass:
        'block w-full px-4 py-3 border border-white/20 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/80 backdrop-blur-sm transition-all duration-200',
    },
    // İhracat Akademi'den çıkarılan rozet stilleri
    badge: {
      base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
      primary: 'bg-primary-100 text-primary-800 border border-primary-200',
      secondary:
        'bg-secondary-100 text-secondary-800 border border-secondary-200',
      success: 'bg-success-100 text-success-800 border border-success-200',
      warning: 'bg-warning-100 text-warning-800 border border-warning-200',
      error: 'bg-error-100 text-error-800 border border-error-200',
      gradient:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0',
    },
    // İhracat Akademi'den çıkarılan tab stilleri
    tab: {
      base: 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
      active: 'border-primary-500 text-primary-600',
      inactive:
        'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300',
    },
    // İhracat Akademi'den çıkarılan progress bar stilleri
    progress: {
      base: 'w-full bg-secondary-200 rounded-full h-2.5',
      bar: 'bg-primary-500 h-2.5 rounded-full transition-all duration-300',
      barSuccess:
        'bg-success-500 h-2.5 rounded-full transition-all duration-300',
      barWarning:
        'bg-warning-500 h-2.5 rounded-full transition-all duration-300',
      barError: 'bg-error-500 h-2.5 rounded-full transition-all duration-300',
    },
    // İhracat Akademi hero section stilleri
    hero: {
      base: 'relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-success-500',
      content: 'relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24',
      title: 'text-4xl md:text-6xl font-bold text-white leading-tight',
      subtitle: 'text-xl md:text-2xl text-white/90 mt-6 max-w-3xl',
      cta: 'mt-8 flex flex-col sm:flex-row gap-4',
    },
    // İhracat Akademi section stilleri
    section: {
      base: 'py-16 md:py-24',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      title:
        'text-3xl md:text-4xl font-bold text-secondary-900 text-center mb-4',
      subtitle:
        'text-lg text-secondary-600 text-center mb-12 max-w-3xl mx-auto',
    },
    // İhracat Akademi stats stilleri
    stats: {
      base: 'grid grid-cols-1 md:grid-cols-3 gap-8',
      item: 'text-center',
      number: 'text-4xl md:text-5xl font-bold text-primary-600 mb-2',
      label: 'text-secondary-600 font-medium',
    },
    // İhracat Akademi feature card stilleri
    feature: {
      base: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
      card: 'bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow duration-200',
      icon: 'w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4',
      title: 'text-xl font-semibold text-secondary-900 mb-3',
      description: 'text-secondary-600 leading-relaxed',
    },
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;
export type DesignSystem = typeof designSystem;
export default designSystem;
