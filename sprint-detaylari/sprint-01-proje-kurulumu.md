# 🚀 SPRINT 1: PROJE KURULUMU

**Sprint Süresi:** 1 Hafta (5-7 gün)  
**Sprint Hedefi:** Çalışan boş proje + Design System temeli  
**Sprint Durumu:** ⏳ Hazır  
**Başlangıç Tarihi:** -  
**Bitiş Tarihi:** -

---

## 🎯 SPRINT HEDEFLERİ

### Ana Hedef

Akademi Port projesinin temel altyapısını kurmak ve geliştirme ortamını hazırlamak.

### Spesifik Hedefler

1. ✅ Next.js 15 + TypeScript projesi çalışır durumda
2. ✅ Tailwind CSS + Shadcn/ui entegre edilmiş
3. ✅ 6 katmanlı klasör yapısı oluşturulmuş
4. ✅ Storybook çalışır durumda
5. ✅ Design tokens (colors, typography, spacing) tanımlanmış
6. ✅ Git repository kurulmuş
7. ✅ Development ortamı hazır

---

## 📋 GÜNLÜK GÖREV PLANI

### 🗓️ GÜN 1: Next.js + TypeScript Kurulumu

#### Görevler

- [ ] Next.js 15 projesi oluştur
- [ ] TypeScript konfigürasyonu
- [ ] ESLint + Prettier kurulumu
- [ ] Git repository oluşturma
- [ ] .gitignore düzenleme
- [ ] README.md oluşturma

#### Komutlar

```bash
# Next.js projesi oluştur
npx create-next-app@latest akademi-port --typescript --tailwind --app --src-dir --import-alias "@/*"

cd akademi-port

# ESLint ve Prettier
npm install -D eslint-config-prettier prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Git
git init
git add .
git commit -m "Initial commit: Next.js 15 + TypeScript setup"
```

#### Konfigürasyon Dosyaları

**tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/presentation/*": ["./src/1-presentation/*"],
      "@/application/*": ["./src/2-application/*"],
      "@/domain/*": ["./src/3-domain/*"],
      "@/infrastructure/*": ["./src/4-infrastructure/*"],
      "@/shared/*": ["./src/5-shared/*"],
      "@/core/*": ["./src/6-core/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**.eslintrc.json**

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn"
  }
}
```

**.prettierrc**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Kabul Kriterleri

- ✅ `npm run dev` çalışıyor
- ✅ TypeScript hataları yok
- ✅ ESLint çalışıyor
- ✅ Git repository oluşturuldu

---

### 🗓️ GÜN 2: Tailwind CSS + Shadcn/ui Kurulumu

#### Görevler

- [ ] Tailwind CSS konfigürasyonu
- [ ] Shadcn/ui kurulumu
- [ ] Custom colors tanımlama
- [ ] Font kurulumu (Inter)
- [ ] İlk component test (Button)

#### Komutlar

```bash
# Shadcn/ui init
npx shadcn-ui@latest init

# İlk componentleri ekle
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
```

#### Konfigürasyon

**tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/1-presentation/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

**app/layout.tsx** (Font setup)

```typescript
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### Kabul Kriterleri

- ✅ Tailwind CSS çalışıyor
- ✅ Shadcn/ui componentleri eklenmiş
- ✅ Custom colors tanımlanmış
- ✅ Font yüklenmiş
- ✅ Button component çalışıyor

---

### 🗓️ GÜN 3: Klasör Yapısı Oluşturma

#### Görevler

- [ ] 6 katmanlı klasör yapısı oluştur
- [ ] Her katman için README.md ekle
- [ ] Index.ts barrel exports oluştur
- [ ] Örnek dosyalar ekle

#### Klasör Yapısı

```bash
mkdir -p src/1-presentation/{components/{ui/{atoms,molecules,organisms,templates},features,shared},app}
mkdir -p src/2-application/{use-cases,services,dto}
mkdir -p src/3-domain/{entities,interfaces/{repositories,services},value-objects,enums}
mkdir -p src/4-infrastructure/{database/{repositories,migrations,seeds},api/{routes,middleware,validators},external,config}
mkdir -p src/5-shared/{utils,constants,hooks,types}
mkdir -p src/6-core/{errors,result,events}
```

#### README Dosyaları

**src/1-presentation/README.md**

```markdown
# Presentation Layer

Bu katman kullanıcı arayüzünden sorumludur.

## İçerik

- `components/ui/atoms`: Temel UI bileşenleri (Button, Input, etc.)
- `components/ui/molecules`: Bileşik UI bileşenleri (FormField, Card, etc.)
- `components/ui/organisms`: Karmaşık UI bileşenleri (Header, Sidebar, etc.)
- `components/ui/templates`: Sayfa şablonları (DashboardLayout, etc.)
- `components/features`: Özellik bazlı bileşenler (programs, companies, etc.)
- `components/shared`: Paylaşılan bileşenler (ErrorBoundary, etc.)
- `app`: Next.js App Router sayfaları

## Kurallar

- Bu katman sadece Application katmanına bağımlıdır
- Business logic içermez
- Sadece UI logic içerir
```

**src/2-application/README.md**

```markdown
# Application Layer

Bu katman iş mantığından sorumludur.

## İçerik

- `use-cases`: Use case pattern implementasyonları
- `services`: Business servisler
- `dto`: Data Transfer Objects

## Kurallar

- Bu katman Domain ve Infrastructure katmanlarına bağımlıdır
- Business logic burada yer alır
- Use case'ler tek sorumluluk prensibine uyar
```

**src/3-domain/README.md**

```markdown
# Domain Layer

Bu katman core business domain'inden sorumludur.

## İçerik

- `entities`: Domain entities
- `interfaces`: Contracts ve interfaces
- `value-objects`: Value objects
- `enums`: Domain enums

## Kurallar

- Bu katman HİÇBİR ŞEYE bağımlı değildir
- Pure business logic içerir
- Framework'lerden bağımsızdır
```

**src/4-infrastructure/README.md**

```markdown
# Infrastructure Layer

Bu katman dış dünya ile iletişimden sorumludur.

## İçerik

- `database`: Database işlemleri
- `api`: API routes
- `external`: Dış servisler (AI, Email, etc.)
- `config`: Konfigürasyon dosyaları

## Kurallar

- Bu katman Domain interface'lerini implement eder
- Dış servislere bağlanır
- Database işlemlerini yönetir
```

**src/5-shared/README.md**

```markdown
# Shared Layer

Bu katman tüm katmanlar tarafından kullanılan ortak kodları içerir.

## İçerik

- `utils`: Utility fonksiyonları
- `constants`: Sabitler
- `hooks`: Custom React hooks
- `types`: Paylaşılan TypeScript tipleri

## Kurallar

- Tüm katmanlar tarafından kullanılabilir
- Business logic içermez
- Pure fonksiyonlar içerir
```

**src/6-core/README.md**

```markdown
# Core Layer

Bu katman core framework kodlarını içerir.

## İçerik

- `errors`: Custom error sınıfları
- `result`: Result pattern implementasyonu
- `events`: Event system

## Kurallar

- Framework-level kod içerir
- Tüm katmanlar tarafından kullanılabilir
- Business logic içermez
```

#### Örnek Dosyalar

**src/6-core/result/Result.ts**

```typescript
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: Error | null;
  private _value: T | null;

  private constructor(isSuccess: boolean, error: Error | null, value: T | null) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value as T;
  }

  public static ok<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: string | Error): Result<U> {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return new Result<U>(false, errorObj, null);
  }
}
```

**src/6-core/errors/AppError.ts**

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}
```

#### Kabul Kriterleri

- ✅ Klasör yapısı oluşturuldu
- ✅ README dosyaları eklendi
- ✅ Örnek dosyalar çalışıyor
- ✅ Import path'ler çalışıyor

---

### 🗓️ GÜN 4: Storybook Kurulumu

#### Görevler

- [ ] Storybook kurulumu
- [ ] Storybook konfigürasyonu
- [ ] Tailwind entegrasyonu
- [ ] İlk story oluşturma (Button)
- [ ] Addon'lar kurulumu

#### Komutlar

```bash
# Storybook kurulumu
npx storybook@latest init

# Addon'lar
npm install -D @storybook/addon-a11y
```

#### Konfigürasyon

**.storybook/main.ts**

```typescript
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

**.storybook/preview.ts**

```typescript
import type { Preview } from '@storybook/react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

#### İlk Story

**src/1-presentation/components/ui/atoms/Button.stories.tsx**

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Add Item
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
};
```

#### Kabul Kriterleri

- ✅ `npm run storybook` çalışıyor
- ✅ Button story görüntüleniyor
- ✅ Dark mode toggle çalışıyor
- ✅ Accessibility addon çalışıyor

---

### 🗓️ GÜN 5: Design Tokens

#### Görevler

- [ ] Design tokens dosyaları oluştur
- [ ] Color palette tanımla
- [ ] Typography tanımla
- [ ] Spacing tanımla
- [ ] Shadow tanımla
- [ ] Border radius tanımla

#### Design Tokens

**src/5-shared/constants/design-tokens.ts**

```typescript
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  // ... diğer renkler
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
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
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
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
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} as const;

export type DesignTokens = typeof designTokens;
```

#### Storybook Documentation

**src/1-presentation/components/ui/DesignTokens.stories.tsx**

```typescript
import type { Meta } from '@storybook/react';
import { colors, typography, spacing } from '@/shared/constants/design-tokens';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Colors = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-8">Color Palette</h1>
    {Object.entries(colors).map(([name, shades]) => (
      <div key={name} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 capitalize">{name}</h2>
        <div className="grid grid-cols-11 gap-2">
          {Object.entries(shades).map(([shade, color]) => (
            <div key={shade} className="text-center">
              <div
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: color }}
              />
              <p className="text-sm font-medium">{shade}</p>
              <p className="text-xs text-gray-500">{color}</p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const Typography = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-8">Typography</h1>
    {Object.entries(typography.fontSize).map(([name, size]) => (
      <div key={name} className="mb-4">
        <p style={{ fontSize: size }} className="font-medium">
          {name} - {size} - The quick brown fox jumps over the lazy dog
        </p>
      </div>
    ))}
  </div>
);

export const Spacing = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-8">Spacing</h1>
    {Object.entries(spacing).map(([name, size]) => (
      <div key={name} className="mb-4 flex items-center">
        <div className="w-32">
          <p className="text-sm font-medium">
            {name} - {size}
          </p>
        </div>
        <div className="bg-primary-500" style={{ width: size, height: '2rem' }} />
      </div>
    ))}
  </div>
);
```

#### Kabul Kriterleri

- ✅ Design tokens tanımlandı
- ✅ Storybook'ta görüntüleniyor
- ✅ TypeScript tipleri çalışıyor
- ✅ Import edilebiliyor

---

### 🗓️ GÜN 6-7: Dokümantasyon ve Test

#### Görevler

- [ ] README.md güncelle
- [ ] CONTRIBUTING.md oluştur
- [ ] package.json scripts güncelle
- [ ] Environment variables setup
- [ ] İlk test sayfası oluştur
- [ ] Git commit ve push

#### README.md

```markdown
# 🎯 Akademi Port

Multi-program e-ihracat dönüşüm platformu.

## 🚀 Teknoloji Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (JWT)
- **AI:** OpenAI GPT-4, Anthropic Claude
- **Documentation:** Storybook

## 📁 Proje Yapısı
```

src/
├── 1-presentation/ # UI Layer
├── 2-application/ # Business Logic Layer
├── 3-domain/ # Domain Layer
├── 4-infrastructure/ # Infrastructure Layer
├── 5-shared/ # Shared Layer
└── 6-core/ # Core Layer

````

## 🛠️ Kurulum

```bash
# Dependencies
npm install

# Development
npm run dev

# Storybook
npm run storybook

# Build
npm run build

# Lint
npm run lint
````

## 📚 Dokümantasyon

- [Mimari Kararlar](./Arşiv/proje-planlama-ve-mimari-kararlar.md)
- [Sprint Planı](./Arşiv/sprint-plani-genel.md)
- [Component Library](http://localhost:6006) (Storybook)

## 🎨 Design System

Design system Storybook'ta dokümante edilmiştir.

```bash
npm run storybook
```

## 📝 Lisans

Private Project

````

#### package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "type-check": "tsc --noEmit"
  }
}
````

#### .env.local.example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Zoom
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
```

#### Test Sayfası

**src/app/page.tsx**

```typescript
import { Button } from '@/presentation/components/ui/atoms/Button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
          Akademi Port
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Multi-Program E-İhracat Dönüşüm Platformu
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="default">Başla</Button>
          <Button variant="outline">Daha Fazla Bilgi</Button>
        </div>
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🎉 Sprint 1 Tamamlandı!
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Next.js 15 + TypeScript + Tailwind CSS + Shadcn/ui + Storybook
          </p>
        </div>
      </div>
    </main>
  );
}
```

#### Kabul Kriterleri

- ✅ README.md güncel
- ✅ Environment variables setup
- ✅ Test sayfası çalışıyor
- ✅ Git commit yapıldı

---

## ✅ SPRINT KABUL KRİTERLERİ

### Teknik Kriterler

- [ ] `npm run dev` çalışıyor
- [ ] `npm run build` başarılı
- [ ] `npm run lint` hatasız
- [ ] `npm run storybook` çalışıyor
- [ ] TypeScript hataları yok
- [ ] Import path'ler çalışıyor

### Fonksiyonel Kriterler

- [ ] Next.js 15 kuruldu
- [ ] TypeScript konfigüre edildi
- [ ] Tailwind CSS çalışıyor
- [ ] Shadcn/ui componentleri eklendi
- [ ] 6 katmanlı klasör yapısı oluşturuldu
- [ ] Storybook çalışıyor
- [ ] Design tokens tanımlandı
- [ ] İlk Button component çalışıyor

### Dokümantasyon Kriterleri

- [ ] README.md güncel
- [ ] Her katman için README.md var
- [ ] Storybook'ta ilk story var
- [ ] Design tokens dokümante edildi

### Kalite Kriterleri

- [ ] ESLint kuralları tanımlı
- [ ] Prettier konfigüre edildi
- [ ] Git repository kuruldu
- [ ] .gitignore düzenlendi

---

## 📊 SPRINT ÇIKTILARI

### Deliverables

1. ✅ Çalışan Next.js 15 projesi
2. ✅ Tailwind CSS + Shadcn/ui entegrasyonu
3. ✅ 6 katmanlı klasör yapısı
4. ✅ Storybook setup
5. ✅ Design tokens
6. ✅ İlk componentler (Button, Input, Card, Badge, Avatar)
7. ✅ Dokümantasyon (README'ler)
8. ✅ Git repository

### Demo İçin Hazır

- Ana sayfa (test sayfası)
- Storybook (Button stories)
- Design tokens (colors, typography, spacing)

---

## 🔄 SPRINT RETROSPECTIVE

### Ne İyi Gitti?

- (Sprint sonunda doldurulacak)

### Ne Geliştirilebilir?

- (Sprint sonunda doldurulacak)

### Öğrenilen Dersler

- (Sprint sonunda doldurulacak)

### Action Items

- (Sprint sonunda doldurulacak)

---

## 📝 NOTLAR

### Önemli Kararlar

- Next.js 15 App Router kullanıldı
- Shadcn/ui copy-paste yaklaşımı seçildi
- 6 katmanlı Clean Architecture uygulandı
- Storybook dokümantasyon aracı olarak seçildi

### Teknik Borçlar

- (Varsa not edilecek)

### Sonraki Sprint İçin

- Sprint 2: Database & Auth
- Supabase kurulumu
- Authentication sistemi
- Migration dosyaları

---

**Sprint Sahibi:** Ömer Ünsal  
**Geliştirici:** AI Assistant + Ömer Ünsal  
**Sprint Başlangıç:** -  
**Sprint Bitiş:** -  
**Sprint Durumu:** ⏳ Hazır

---

🚀 **SPRINT 1 BAŞLAMAYA HAZIR!**
