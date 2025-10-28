# 🎯 AKADEMİ PORT - PROJE PLANLAMA VE MİMARİ KARARLAR

**Tarih:** 28 Ekim 2025  
**Proje Adı:** Akademi Port  
**Önceki Proje:** ia-6 (İhracat Akademi)  
**Durum:** Planlama Tamamlandı ✅

---

## 📋 İÇİNDEKİLER

1. [Proje Vizyonu ve Temel Fark](#proje-vizyonu)
2. [Mimari Kararlar](#mimari-kararlar)
3. [Tasarım Sistemi](#tasarım-sistemi)
4. [AI & Otomasyon Ekosistemi](#ai-otomasyon)
5. [Entegrasyon Planı](#entegrasyon-plani)
6. [Teknoloji Stack](#teknoloji-stack)
7. [Geliştirme Roadmap](#gelistirme-roadmap)
8. [Maliyet Tahmini](#maliyet-tahmini)

---

## 🎯 PROJE VİZYONU VE TEMEL FARK {#proje-vizyonu}

### Eski Proje (ia-6) Problemi
```
❌ Tek Havuz Sistemi
- Sadece Kayseri'de 20 firma
- Tek bir program/grup
- İl bazlı ayrım YOK
- Ölçeklenebilir değil
```

### Yeni Proje (Akademi Port) Çözümü
```
✅ Multi-Program/Grup Sistemi
- Farklı illerde farklı programlar
- Aynı ilde birden fazla grup
- Her program bağımsız yönetilebilir
- Sonsuz ölçeklenebilir

Örnek Yapı:
├── Kayseri E-İhracat 2025 (20 firma)
├── Bursa Dijital Dönüşüm 2025 (15 firma)
├── Ankara Tekstil Özel 2025 (30 firma)
├── Antalya Turizm E-Ticaret 2025 (25 firma)
└── Kayseri Gıda Grubu 2025 (10 firma)
```

---

## 🏗️ MİMARİ KARARLAR {#mimari-kararlar}

### Seçilen Mimari: Clean Architecture + Modular Monolith

#### Neden Bu Mimari?
```
✅ Loose Coupling - Modüller birbirine bağımlı değil
✅ High Cohesion - Her katman kendi işine odaklı
✅ Testability - Her katman ayrı test edilebilir
✅ Maintainability - Değişiklikler izole
✅ Scalability - Kolayca büyütülebilir
✅ Reusability - Kod tekrarı minimum

❌ Eski Projede Yaşanan Sorun:
"Bir modülde değişiklik → Başka modülde hata"
Bu yeni mimaride OLMAYACAK!
```

---

### 6 Katmanlı Yapı

```
┌─────────────────────────────────────────────────────┐
│         1. PRESENTATION LAYER (UI)                   │
│    Components, Pages, Forms, Layouts                 │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│      2. APPLICATION LAYER (Business Logic)           │
│    Use Cases, Services, DTOs                         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│         3. DOMAIN LAYER (Core Business)              │
│    Entities, Interfaces, Value Objects, Enums        │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│    4. INFRASTRUCTURE LAYER (External)                │
│    Database, API, External Services                  │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│         5. SHARED LAYER (Common)                     │
│    Utils, Constants, Hooks, Types                    │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│         6. CORE LAYER (Foundation)                   │
│    Errors, Result Pattern, Events                    │
└─────────────────────────────────────────────────────┘
```

---

### Detaylı Klasör Yapısı

```
akademi-port/
│
├── src/
│   │
│   ├── 1-presentation/              # UI KATMANI
│   │   ├── components/
│   │   │   ├── ui/                  # Atomic Design System
│   │   │   │   ├── atoms/           # Button, Input, Badge
│   │   │   │   ├── molecules/       # FormField, Card, Modal
│   │   │   │   ├── organisms/       # Header, Sidebar, DataTable
│   │   │   │   └── templates/       # PageLayout, DashboardLayout
│   │   │   │
│   │   │   ├── features/            # Feature-based components
│   │   │   │   ├── programs/        # Program components
│   │   │   │   ├── companies/       # Company components
│   │   │   │   ├── consultants/     # Consultant components
│   │   │   │   ├── trainings/       # Training components
│   │   │   │   ├── projects/        # Project components
│   │   │   │   ├── tasks/           # Task components
│   │   │   │   └── events/          # Event components
│   │   │   │
│   │   │   └── shared/              # Shared components
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── LoadingState.tsx
│   │   │       └── EmptyState.tsx
│   │   │
│   │   └── app/                     # Next.js App Router
│   │       ├── (auth)/              # Auth pages
│   │       ├── (admin)/             # Master Admin panel
│   │       ├── (program-manager)/   # Program Manager panel
│   │       ├── (consultant)/        # Consultant panel
│   │       ├── (company)/           # Company panel
│   │       └── (public)/            # Public website
│   │
│   ├── 2-application/               # İŞ MANTIĞI KATMANI
│   │   ├── use-cases/               # Use Case Pattern
│   │   │   ├── programs/
│   │   │   │   ├── create-program.use-case.ts
│   │   │   │   ├── update-program.use-case.ts
│   │   │   │   ├── delete-program.use-case.ts
│   │   │   │   ├── assign-consultant.use-case.ts
│   │   │   │   └── get-program-stats.use-case.ts
│   │   │   ├── companies/
│   │   │   ├── consultants/
│   │   │   ├── trainings/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── auth/
│   │   │
│   │   ├── services/                # Business Services
│   │   │   ├── program.service.ts
│   │   │   ├── company.service.ts
│   │   │   ├── training.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── ai.service.ts
│   │   │   └── analytics.service.ts
│   │   │
│   │   └── dto/                     # Data Transfer Objects
│   │       ├── program.dto.ts
│   │       ├── company.dto.ts
│   │       └── user.dto.ts
│   │
│   ├── 3-domain/                    # DOMAIN KATMANI
│   │   ├── entities/                # Domain Entities
│   │   │   ├── program.entity.ts
│   │   │   ├── company.entity.ts
│   │   │   ├── user.entity.ts
│   │   │   ├── training.entity.ts
│   │   │   ├── project.entity.ts
│   │   │   └── task.entity.ts
│   │   │
│   │   ├── interfaces/              # Contracts/Interfaces
│   │   │   ├── repositories/
│   │   │   │   ├── program.repository.interface.ts
│   │   │   │   ├── company.repository.interface.ts
│   │   │   │   └── user.repository.interface.ts
│   │   │   └── services/
│   │   │       ├── email.service.interface.ts
│   │   │       ├── ai.service.interface.ts
│   │   │       └── storage.service.interface.ts
│   │   │
│   │   ├── value-objects/           # Value Objects
│   │   │   ├── email.vo.ts
│   │   │   ├── phone.vo.ts
│   │   │   └── address.vo.ts
│   │   │
│   │   └── enums/                   # Domain Enums
│   │       ├── user-role.enum.ts
│   │       ├── program-status.enum.ts
│   │       ├── task-status.enum.ts
│   │       └── training-type.enum.ts
│   │
│   ├── 4-infrastructure/            # ALTYAPI KATMANI
│   │   ├── database/
│   │   │   ├── repositories/        # Repository Implementation
│   │   │   │   ├── program.repository.ts
│   │   │   │   ├── company.repository.ts
│   │   │   │   └── user.repository.ts
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   │
│   │   ├── api/                     # API Layer
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── validators/
│   │   │
│   │   ├── external/                # External Services
│   │   │   ├── ai/
│   │   │   │   ├── openai.service.ts
│   │   │   │   └── claude.service.ts
│   │   │   ├── email/
│   │   │   │   └── sendgrid.service.ts
│   │   │   ├── storage/
│   │   │   │   └── supabase-storage.service.ts
│   │   │   ├── zoom/
│   │   │   │   └── zoom.service.ts
│   │   │   └── whatsapp/
│   │   │       └── whatsapp.service.ts
│   │   │
│   │   └── config/                  # Configuration
│   │       ├── database.config.ts
│   │       ├── ai.config.ts
│   │       └── app.config.ts
│   │
│   ├── 5-shared/                    # PAYLAŞILAN KATMAN
│   │   ├── utils/                   # Utility Functions
│   │   │   ├── date.utils.ts
│   │   │   ├── string.utils.ts
│   │   │   ├── validation.utils.ts
│   │   │   └── format.utils.ts
│   │   │
│   │   ├── constants/               # Constants
│   │   │   ├── routes.constants.ts
│   │   │   ├── messages.constants.ts
│   │   │   └── config.constants.ts
│   │   │
│   │   ├── hooks/                   # Custom Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useProgram.ts
│   │   │   ├── usePermission.ts
│   │   │   └── useAI.ts
│   │   │
│   │   └── types/                   # Shared Types
│   │       ├── api.types.ts
│   │       └── common.types.ts
│   │
│   └── 6-core/                      # CORE KATMAN
│       ├── errors/                  # Custom Errors
│       │   ├── AppError.ts
│       │   ├── ValidationError.ts
│       │   ├── NotFoundError.ts
│       │   └── UnauthorizedError.ts
│       │
│       ├── result/                  # Result Pattern
│       │   └── Result.ts
│       │
│       └── events/                  # Event System
│           ├── EventEmitter.ts
│           └── events/
│               ├── program-created.event.ts
│               ├── company-assigned.event.ts
│               └── task-completed.event.ts
│
├── public/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── guides/
│
└── Arşiv/
    ├── ia-6-proje-analizi.md
    └── proje-planlama-ve-mimari-kararlar.md
```

---

### Katmanlar Arası İletişim Kuralları

#### ✅ İZİN VERİLEN
```
Presentation → Application → Domain → Infrastructure
     ↓              ↓           ↓            ↓
   (UI)      (Business Logic) (Core)   (Database)
```

#### ❌ YASAK (Bağımlılık Ters Yönde Olamaz)
```
Infrastructure → Domain (X)
Infrastructure → Application (X)
Domain → Infrastructure (X)
```

---

### Örnek Akış: Program Oluşturma

```typescript
// 1. PRESENTATION LAYER (UI)
// src/presentation/components/features/programs/ProgramForm.tsx
'use client';

import { CreateProgramUseCase } from '@/application/use-cases/programs';
import { ProgramDto } from '@/application/dto';

export function ProgramForm() {
  const createProgram = new CreateProgramUseCase();
  
  const handleSubmit = async (data: ProgramDto) => {
    const result = await createProgram.execute(data);
    
    if (result.isSuccess) {
      toast.success('Program oluşturuldu!');
    } else {
      toast.error(result.error.message);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// 2. APPLICATION LAYER (Use Case)
// src/application/use-cases/programs/create-program.use-case.ts
import { IProgramRepository } from '@/domain/interfaces/repositories';
import { Program } from '@/domain/entities';
import { Result } from '@/core/result';

export class CreateProgramUseCase {
  constructor(
    private programRepository: IProgramRepository
  ) {}
  
  async execute(dto: ProgramDto): Promise<Result<Program>> {
    // 1. Validation
    if (!dto.name) {
      return Result.fail('Program adı gerekli');
    }
    
    // 2. Business Logic
    const program = Program.create(dto);
    
    // 3. Save
    const savedProgram = await this.programRepository.create(program);
    
    // 4. Event (optional)
    EventEmitter.emit('program.created', savedProgram);
    
    return Result.ok(savedProgram);
  }
}

// 3. DOMAIN LAYER (Entity)
// src/domain/entities/program.entity.ts
import { ProgramStatus } from '@/domain/enums';

export class Program {
  constructor(
    public id: string,
    public name: string,
    public city: string,
    public status: ProgramStatus,
    public startDate: Date,
    public endDate: Date
  ) {}
  
  static create(data: any): Program {
    return new Program(
      crypto.randomUUID(),
      data.name,
      data.city,
      ProgramStatus.PLANNED,
      new Date(data.startDate),
      new Date(data.endDate)
    );
  }
  
  // Domain methods
  activate(): void {
    if (this.status !== ProgramStatus.PLANNED) {
      throw new Error('Sadece planlanan programlar aktif edilebilir');
    }
    this.status = ProgramStatus.ACTIVE;
  }
  
  isActive(): boolean {
    return this.status === ProgramStatus.ACTIVE;
  }
}

// 4. INFRASTRUCTURE LAYER (Repository)
// src/infrastructure/database/repositories/program.repository.ts
import { IProgramRepository } from '@/domain/interfaces/repositories';
import { Program } from '@/domain/entities';
import { supabase } from '@/infrastructure/database/client';

export class ProgramRepository implements IProgramRepository {
  async create(program: Program): Promise<Program> {
    const { data, error } = await supabase
      .from('programs')
      .insert({
        id: program.id,
        name: program.name,
        city: program.city,
        status: program.status,
        start_date: program.startDate,
        end_date: program.endDate
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return this.mapToDomain(data);
  }
  
  private mapToDomain(data: any): Program {
    return new Program(
      data.id,
      data.name,
      data.city,
      data.status,
      new Date(data.start_date),
      new Date(data.end_date)
    );
  }
}
```

---

## 🎨 TASARIM SİSTEMİ {#tasarim-sistemi}

### Seçilen Stack: Shadcn/ui + Tailwind CSS

#### Neden Shadcn/ui?
```
✅ Modern, minimal, accessible
✅ Radix UI primitives (accessibility built-in)
✅ Tailwind CSS (utility-first)
✅ Copy-paste components (full control)
✅ Dark mode built-in
✅ TypeScript support
✅ Dünya standartlarında (Vercel, Linear, Cal.com kullanıyor)
✅ Storybook ile dokümante edilebilir
```

---

### Canlı ve Renkli Palet

```typescript
// Design Tokens
export const colors = {
  // Primary (Canlı Mavi-Mor Gradient)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Ana mavi
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary (Canlı Mor)
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Ana mor
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Accent (Canlı Turuncu)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Ana turuncu
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Success (Canlı Yeşil)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Ana yeşil
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning (Canlı Sarı)
  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',  // Ana sarı
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  
  // Error (Canlı Kırmızı)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Ana kırmızı
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Info (Canlı Cyan)
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',  // Ana cyan
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  
  // Neutral (Modern Gri)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Gradients (Canlı Gradient'ler)
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
    secondary: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
    sunset: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    ocean: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
    purple: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  }
};

// Typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing (8px grid system)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

---

### Atomic Design System

```
Atoms (En küçük parçalar)
  ↓
Molecules (Atom kombinasyonları)
  ↓
Organisms (Molecule kombinasyonları)
  ↓
Templates (Sayfa şablonları)
  ↓
Pages (Gerçek sayfalar)
```

#### Component Örnekleri

**Atoms:**
- Button (Primary, Secondary, Outline, Ghost, Danger)
- Input (Text, Email, Password, Number)
- Badge (Success, Warning, Error, Info)
- Avatar
- Icon
- Label
- Checkbox
- Radio
- Switch

**Molecules:**
- FormField (Label + Input + Error)
- Card (Header + Body + Footer)
- Modal (Overlay + Content + Actions)
- Dropdown
- Tooltip
- Alert
- Toast

**Organisms:**
- Header (Logo + Navigation + UserMenu)
- Sidebar (Navigation + User + Settings)
- DataTable (Header + Body + Pagination + Filters)
- Form (Multiple FormFields + Actions)
- Dashboard Card (Stats + Chart + Actions)

**Templates:**
- DashboardLayout (Sidebar + Header + Content)
- AuthLayout (Centered + Card)
- PublicLayout (Header + Content + Footer)

---

### Accessibility (a11y) Standartları

```
✅ WCAG 2.1 AA Compliance
✅ Keyboard navigation
✅ Screen reader support
✅ ARIA attributes
✅ Focus management
✅ Color contrast (4.5:1 minimum)
✅ Skip to content link
✅ Form validation messages
✅ Error announcements
```

---

### Dark Mode

```typescript
// Otomatik dark mode desteği
- System preference detection
- Manual toggle
- Persisted preference
- Smooth transitions
- All components dark mode ready
```

---

### Storybook Documentation

```bash
# Component documentation
npm run storybook

# Her component için:
- Visual documentation
- Props documentation
- Usage examples
- Accessibility notes
- Design tokens reference
```

---

## 🤖 AI & OTOMASYON EKOSİSTEMİ {#ai-otomasyon}

### AI Provider Seçimi: Hybrid (OpenAI + Claude)

```typescript
// Use case bazlı AI seçimi
{
  contentGeneration: 'OpenAI GPT-4',      // Kısa içerik, hızlı
  longDocumentAnalysis: 'Claude',          // Uzun döküman analizi
  codeGeneration: 'Claude',                // Kod üretimi
  chatbot: 'OpenAI GPT-4',                 // Hızlı yanıt
  summarization: 'Claude',                 // Özet çıkarma
  translation: 'OpenAI GPT-4',             // Çeviri
  dataAnalysis: 'OpenAI GPT-4',            // Veri analizi
}
```

---

### 1️⃣ İçerik AI Asistanı 📝

#### A. Görev Açıklaması Üretimi
```
Danışman: "Firma için Amazon mağaza açılışı"
    ↓ AI
Detaylı görev açıklaması + Adımlar + İlgili eğitimler + Dikkat edilecekler
```

#### B. Eğitim İçeriği Özetleme
```
45 dakikalık video → AI → 2 dakikalık özet
- Ana konular
- Önemli noktalar
- Yapılacaklar listesi
```

#### C. Rapor Otomatik Oluşturma
```
Aylık firma ilerleme raporu
- Tamamlanan görevler
- Eğitim durumu
- Öne çıkanlar
- Dikkat gereken noktalar
- AI önerileri
```

---

### 2️⃣ Analiz & Tahmin AI 🔍

#### A. Firma Risk Analizi
```typescript
{
  riskScore: 65,
  riskLevel: "ORTA",
  factors: [
    { factor: "Görev Tamamlama", value: 45, impact: "YÜKSEK", trend: "DÜŞÜYOR" },
    { factor: "Eğitim Katılımı", value: 30, impact: "ORTA", trend: "DÜŞÜK" }
  ],
  recommendations: [
    "🚨 Acil: Firma ile toplantı planlanmalı",
    "📚 Eğitim motivasyonu artırılmalı"
  ]
}
```

#### B. Başarı Tahmini
```
Program başında AI tahmin yapar:
- Başarı olasılığı: %78
- Güçlü yönler
- Risk faktörleri
- Önerilen strateji
```

#### C. Trend Analizi
```
Tüm programları karşılaştırır:
- Genel durum
- En başarılı firmalar
- Destek gereken firmalar
- Benchmark'ler
```

---

### 3️⃣ Destek AI (Chatbot) 💬

#### Chatbot Konumları
```
✅ Public Website (Ziyaretçi desteği)
✅ Firma Paneli (7/24 destek)
✅ Danışman Paneli (Hızlı bilgi)
✅ Program Yöneticisi Paneli (Analiz desteği)
✅ Master Admin Paneli (Sistem desteği)
```

#### Özellikler
```
✅ 7/24 otomatik yanıt
✅ Eğitim içeriği arama
✅ Akıllı yönlendirme
✅ Danışman atama
✅ Randevu oluşturma
✅ Sık sorulan sorular
✅ Çoklu dil desteği
```

---

### 4️⃣ Otomasyon Workflows ⚙️

#### A. Görev Otomasyonu
```
Trigger: Görev tamamlandı
→ AI: Sonraki görev ne?
→ Otomatik yeni görev oluştur
→ İlgili eğitimleri ata
→ Danışmana bildirim gönder
```

#### B. Hatırlatma Otomasyonu
```
IF firma 3 gündür eğitim izlemedi
  → Email + WhatsApp + Dashboard bildirimi

IF görev deadline'ı yaklaşıyor (2 gün)
  → Firmaya hatırlatma
  → Danışmana bildirim

IF firma 1 haftadır sisteme girmedi
  → Danışmana "Risk" uyarısı
  → Program yöneticisine rapor
```

#### C. Akıllı Atama
```
Yeni firma geldiğinde AI önerir:
- En uygun danışman
- Önerilen proje şablonu
- Tahmini başarı oranı
```

---

## 🔌 ENTEGRASYON PLANI {#entegrasyon-plani}

### Faz 1: Temel Altyapı (Ay 1-2)

```
✅ Supabase (Database + Auth + Storage)
✅ Vercel (Hosting + Edge Functions)
✅ SendGrid (Email)
✅ Sentry (Error tracking)
✅ Google Analytics 4 (Analytics)
```

---

### Faz 2: AI & Otomasyon (Ay 2-3)

```
✅ OpenAI API (GPT-4)
✅ Anthropic API (Claude)
✅ Vercel AI SDK (Streaming, multi-provider)
✅ Chatbot entegrasyonu (Tüm paneller)
✅ Otomatik raporlama
✅ İçerik üretimi
```

---

### Faz 3: İletişim (Ay 3-4)

```
✅ Zoom API (Toplantılar, etkinlikler)
✅ WhatsApp Business API (Bildirimler)
✅ Push Notifications (OneSignal/FCM)
✅ Email Templates (MJML)
```

---

### Faz 4: Analitik & İzleme (Ay 4-5)

```
✅ Mixpanel (Event tracking, funnels)
✅ Custom Dashboards (Metabase/Superset)
✅ AI Analytics (Tahmin, trend)
✅ Real-time monitoring
```

---

### Faz 5: Gelişmiş Özellikler (Ay 5+)

```
✅ Semantic Search (Pinecone/Weaviate)
✅ Advanced AI (RAG, fine-tuning)
✅ Social Media Integration
✅ Payment System (ileride)
```

---

### Entegrasyon Detayları

#### 📅 Zoom API
```typescript
Özellikler:
✅ Otomatik toplantı oluşturma
✅ Takvim entegrasyonu
✅ Katılım takibi
✅ Kayıt saklama
✅ Otomatik hatırlatma

Kullanım:
- Danışman-Firma Randevuları
- Online Eğitim Etkinlikleri
- Grup Workshopları
- Program Kick-off Toplantıları
```

#### 📧 Email (SendGrid)
```typescript
Email Tipleri:
✅ Hoş geldiniz emaili
✅ Görev atama bildirimi
✅ Deadline hatırlatması
✅ Haftalık özet raporu
✅ Başarı kutlaması
✅ Sertifika gönderimi

Özellikler:
- AI personalization
- Template system
- A/B testing
- Analytics
```

#### 💬 WhatsApp Business API
```typescript
Kullanım:
✅ Acil bildirimler
✅ Günlük hatırlatmalar
✅ Danışman-firma iletişimi
✅ Chatbot desteği
✅ Hızlı yanıt şablonları
```

#### 🎥 YouTube (Eğitim Videoları)
```typescript
Neden YouTube?
✅ Ücretsiz
✅ Sınırsız storage
✅ Otomatik transcoding
✅ Adaptive streaming
✅ Unlisted video desteği

Kullanım:
- Tüm eğitim videoları Unlisted
- Sadece panel üzerinden erişim
- İzleme takibi (custom tracking)
- Otomatik altyazı (AI)
```

#### 📊 Analytics Stack
```typescript
Google Analytics 4:
- Sayfa görüntülemeleri
- Kullanıcı davranışları
- Conversion tracking

Mixpanel:
- Event tracking
- Funnel analysis
- Cohort analysis
- A/B testing
- User segmentation

Custom Dashboards:
- Real-time metrics
- AI insights
- Custom reports
```

#### 🗄️ Storage
```typescript
Supabase Storage:
- CV ve belgeler
- Firma dökümanları
- Profil fotoğrafları

YouTube:
- Eğitim videoları (Unlisted)

Cloudflare R2 (ileride):
- Büyük dosyalar
- CDN entegrasyonu
```

---

## 💻 TEKNOLOJİ STACK {#teknoloji-stack}

### Frontend
```
- Next.js 15+ (App Router)
- React 19+
- TypeScript (Strict mode)
- Tailwind CSS 4+
- Shadcn/ui
- Radix UI (Primitives)
- Framer Motion (Animations)
- React Hook Form (Forms)
- Zod (Validation)
- Zustand (State management)
- TanStack Query (Data fetching)
- TanStack Table (Data tables)
```

### Backend
```
- Next.js API Routes
- Supabase (PostgreSQL)
- Prisma (ORM - opsiyonel)
- Supabase Auth (JWT)
- Supabase Storage
- Edge Functions (Vercel)
```

### AI & ML
```
- OpenAI API (GPT-4)
- Anthropic API (Claude)
- Vercel AI SDK
- LangChain (opsiyonel)
- Pinecone (Vector DB - ileride)
```

### DevOps & Tools
```
- Vercel (Hosting)
- GitHub (Version control)
- GitHub Actions (CI/CD)
- Sentry (Error tracking)
- Storybook (Component docs)
- Jest + Testing Library (Unit tests)
- Playwright (E2E tests)
- ESLint + Prettier (Code quality)
```

### External Services
```
- SendGrid (Email)
- Zoom API (Meetings)
- WhatsApp Business API
- OneSignal (Push notifications)
- Google Analytics 4
- Mixpanel
```

---

## 🗄️ VERİTABANI MİMARİSİ

### Yeni Ana Tablo: `programs`

```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  region VARCHAR(100),
  program_type VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INTEGER,
  max_companies INTEGER,
  status VARCHAR(50) DEFAULT 'planned',
  sponsor VARCHAR(255),
  budget DECIMAL(15, 2),
  program_manager_id UUID REFERENCES users(id),
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_city ON programs(city);
CREATE INDEX idx_programs_manager ON programs(program_manager_id);
```

---

### Yeni İlişki Tablosu: `user_programs`

```sql
CREATE TABLE user_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'program_manager', 'consultant'
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  
  UNIQUE(user_id, program_id)
);

CREATE INDEX idx_user_programs_user ON user_programs(user_id);
CREATE INDEX idx_user_programs_program ON user_programs(program_id);
```

---

### Güncellenecek Tablolar

```sql
-- companies tablosuna program_id ekle
ALTER TABLE companies 
ADD COLUMN program_id UUID REFERENCES programs(id);

CREATE INDEX idx_companies_program ON companies(program_id);

-- projects tablosuna program_id ekle
ALTER TABLE projects 
ADD COLUMN program_id UUID REFERENCES programs(id);

CREATE INDEX idx_projects_program ON projects(program_id);

-- trainings tablosuna program_id ekle (NULL ise global)
ALTER TABLE trainings 
ADD COLUMN program_id UUID REFERENCES programs(id) NULL;

CREATE INDEX idx_trainings_program ON trainings(program_id);

-- events tablosuna program_id ekle
ALTER TABLE events 
ADD COLUMN program_id UUID REFERENCES programs(id);

CREATE INDEX idx_events_program ON events(program_id);
```

---

### Yeni Rol Sistemi

```typescript
export enum UserRole {
  MASTER_ADMIN = 'master_admin',
  PROGRAM_MANAGER = 'program_manager',
  CONSULTANT = 'consultant',
  COMPANY_ADMIN = 'company_admin',
  COMPANY_USER = 'company_user',
  OBSERVER = 'observer', // İleride
}

export enum ProgramStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}
```

---

## 🚀 GELİŞTİRME ROADMAP {#gelistirme-roadmap}

### Faz 1: Temel Altyapı (2-3 hafta)

#### Sprint 1: Proje Kurulumu (1 hafta)
```
✅ Next.js 15 + TypeScript kurulumu
✅ Tailwind CSS + Shadcn/ui kurulumu
✅ Klasör yapısı oluşturma (6 katman)
✅ ESLint + Prettier konfigürasyonu
✅ Git repository setup
✅ Storybook kurulumu
✅ Design tokens oluşturma
```

#### Sprint 2: Database & Auth (1 hafta)
```
✅ Supabase projesi oluşturma
✅ Database schema tasarımı
✅ Migration dosyaları
✅ Seed data
✅ Authentication sistemi
✅ Role-based middleware
✅ API route structure
```

#### Sprint 3: UI Foundation (1 hafta)
```
✅ Atomic components (Atoms)
✅ Molecule components
✅ Layout templates
✅ Dark mode setup
✅ Storybook documentation
✅ Accessibility testing
```

---

### Faz 2: Core Modules (3-4 hafta)

#### Sprint 4: Program Yönetimi (1 hafta)
```
✅ Program CRUD operations
✅ Program dashboard (Master Admin)
✅ Program yöneticisi atama
✅ Danışman atama (Many-to-Many)
✅ Firma atama
✅ Program filtreleme ve arama
```

#### Sprint 5: Kullanıcı Yönetimi (1 hafta)
```
✅ User CRUD operations
✅ Multi-role support
✅ Program bazlı yetkilendirme
✅ User profile
✅ User settings
```

#### Sprint 6: Firma Yönetimi (1 hafta)
```
✅ Company CRUD operations
✅ Program'a firma atama
✅ Company dashboard
✅ Company users management
✅ Company profile
```

#### Sprint 7: Danışman Paneli (1 hafta)
```
✅ Consultant dashboard
✅ Program seçici
✅ Atanmış firmalar listesi
✅ Firma detay sayfası
✅ Quick actions
```

---

### Faz 3: İş Modülleri (4-5 hafta)

#### Sprint 8: Proje Yönetimi (1.5 hafta)
```
✅ Ana Proje → Alt Proje → Görev hiyerarşisi
✅ Proje CRUD operations
✅ Görev CRUD operations
✅ Görev atama ve takip
✅ Durum yönetimi
✅ İlerleme hesaplama
✅ Danışman onay sistemi
```

#### Sprint 9: Eğitim Yönetimi (1.5 hafta)
```
✅ Video eğitim yönetimi
✅ Döküman yönetimi
✅ Global vs Program eğitimleri
✅ Firma'ya eğitim atama
✅ İzleme takibi
✅ Sıralı eğitim sistemi
✅ Kilitli içerik
```

#### Sprint 10: Etkinlik Yönetimi (1 hafta)
```
✅ Etkinlik CRUD operations
✅ Takvim görünümü (FullCalendar)
✅ Zoom entegrasyonu
✅ Katılım takibi
✅ Otomatik hatırlatmalar
```

#### Sprint 11: Randevu Yönetimi (1 hafta)
```
✅ Randevu oluşturma
✅ Danışman müsaitlik takvimi
✅ Zoom entegrasyonu
✅ Revize sistemi
✅ Otomatik bildirimler
```

---

### Faz 4: AI & Otomasyon (2-3 hafta)

#### Sprint 12: AI Altyapısı (1 hafta)
```
✅ OpenAI API entegrasyonu
✅ Claude API entegrasyonu
✅ Vercel AI SDK setup
✅ AI service layer
✅ Prompt management
✅ Token tracking
```

#### Sprint 13: AI Özellikleri (1 hafta)
```
✅ Görev açıklaması üretimi
✅ Eğitim özeti çıkarma
✅ Rapor otomatik oluşturma
✅ Firma risk analizi
✅ Başarı tahmini
```

#### Sprint 14: Chatbot (1 hafta)
```
✅ Chatbot UI component
✅ Chatbot backend
✅ Context management
✅ Eğitim içeriği arama
✅ Akıllı yönlendirme
✅ Tüm panellere entegrasyon
```

---

### Faz 5: İletişim & Bildirimler (2 hafta)

#### Sprint 15: Email Sistemi (1 hafta)
```
✅ SendGrid entegrasyonu
✅ Email templates (MJML)
✅ Transactional emails
✅ Email queue system
✅ Email analytics
```

#### Sprint 16: Bildirim Sistemi (1 hafta)
```
✅ In-app notifications
✅ Push notifications (OneSignal)
✅ WhatsApp entegrasyonu
✅ Bildirim tercihleri
✅ Bildirim geçmişi
```

---

### Faz 6: Raporlama & Analitik (2 hafta)

#### Sprint 17: Dashboard & Raporlar (1 hafta)
```
✅ Master Admin dashboard
✅ Program Manager dashboard
✅ Consultant dashboard
✅ Company dashboard
✅ Custom reports
✅ Export functionality (PDF, Excel)
```

#### Sprint 18: Analytics (1 hafta)
```
✅ Google Analytics 4 entegrasyonu
✅ Mixpanel entegrasyonu
✅ Custom event tracking
✅ Funnel analysis
✅ AI-powered insights
```

---

### Faz 7: Public Website (1-2 hafta)

#### Sprint 19: Public Pages (1 hafta)
```
✅ Ana sayfa
✅ Program hakkında
✅ Platform özellikleri
✅ Başarı hikayeleri
✅ SSS
✅ İletişim
✅ Kariyer
```

#### Sprint 20: SEO & Performance (1 hafta)
```
✅ SEO optimization
✅ Meta tags
✅ Sitemap
✅ Performance optimization
✅ Image optimization
✅ Lighthouse score > 90
```

---

### Faz 8: Testing & QA (2 hafta)

#### Sprint 21: Testing (1 hafta)
```
✅ Unit tests (Jest)
✅ Integration tests
✅ E2E tests (Playwright)
✅ Accessibility tests
✅ Performance tests
```

#### Sprint 22: QA & Bug Fixes (1 hafta)
```
✅ Manual testing
✅ Bug fixing
✅ Cross-browser testing
✅ Mobile responsiveness
✅ Security audit
```

---

### Faz 9: Deployment & Launch (1 hafta)

#### Sprint 23: Production Setup
```
✅ Production database setup
✅ Environment variables
✅ CI/CD pipeline (GitHub Actions)
✅ Monitoring setup (Sentry)
✅ Backup strategy
✅ Documentation
✅ User training materials
```

---

### TOPLAM SÜRE: 18-22 Hafta (4.5-5.5 Ay)

---

## 💰 MALİYET TAHMİNİ {#maliyet-tahmini}

### Geliştirme Aşaması (İlk 6 Ay)

```
🆓 Ücretsiz Tier (Development):
- Vercel (Hobby): $0
- Supabase (Free): $0
- Sentry (Developer): $0
- SendGrid (100 email/day): $0
- Storybook (Self-hosted): $0
TOPLAM: $0/ay

💼 Development + Testing:
- Vercel (Pro): $20/ay
- Supabase (Pro): $25/ay
- OpenAI API (Testing): ~$20-50/ay
- SendGrid (Essentials): $20/ay
TOPLAM: ~$85-115/ay
```

---

### Production (100 Firma)

```
💼 Startup Tier:
- Vercel (Pro): $20/ay
- Supabase (Pro): $25/ay
- OpenAI API: ~$50-100/ay
- Anthropic API: ~$30-50/ay
- SendGrid (Essentials): $20/ay
- Zoom (Pro): $15/ay
- Sentry (Team): $26/ay
- OneSignal (Growth): $9/ay
- Mixpanel (Growth): $25/ay
TOPLAM: ~$220-290/ay
```

---

### Production (500+ Firma)

```
🚀 Scale Tier:
- Vercel (Team): $100/ay
- Supabase (Team): $100/ay
- OpenAI API: ~$300-500/ay
- Anthropic API: ~$100-200/ay
- SendGrid (Premier): $90/ay
- Zoom (Business): $20/ay
- Sentry (Business): $80/ay
- OneSignal (Professional): $99/ay
- Mixpanel (Enterprise): $25/ay
- WhatsApp Business: ~$50-100/ay
TOPLAM: ~$964-1,314/ay
```

---

### Yıllık Maliyet Tahmini

```
Geliştirme (6 ay): $510-690
İlk Yıl Production (6 ay, 100 firma): $1,320-1,740
İkinci Yıl (500+ firma): $11,568-15,768

TOPLAM İLK YIL: ~$1,830-2,430
TOPLAM İKİNCİ YIL: ~$11,568-15,768
```

---

## 📊 BAŞARI KRİTERLERİ

### Teknik Metrikler
```
✅ Lighthouse Score > 90
✅ First Contentful Paint < 1.5s
✅ Time to Interactive < 3s
✅ Uptime > 99.9%
✅ API Response Time < 200ms
✅ Error Rate < 0.1%
✅ Test Coverage > 80%
```

### Kullanıcı Metrikleri
```
✅ User Satisfaction > 4.5/5
✅ Task Completion Rate > 90%
✅ Daily Active Users > 70%
✅ Session Duration > 10 min
✅ Bounce Rate < 30%
```

### İş Metrikleri
```
✅ Firma Başarı Oranı > 75%
✅ Görev Tamamlama > 80%
✅ Eğitim Tamamlama > 70%
✅ Danışman Memnuniyeti > 4/5
✅ Program Tamamlama > 85%
```

---

## 🎯 ÖNEMLİ NOTLAR

### Mimari Prensipler
```
1. ✅ Her modül bağımsız olmalı (Loose Coupling)
2. ✅ Katmanlar arası bağımlılık tek yönlü (Dependency Rule)
3. ✅ Domain layer hiçbir şeye bağımlı olmamalı
4. ✅ Interface'ler domain layer'da, implementasyonlar infrastructure'da
5. ✅ Business logic application layer'da
6. ✅ UI logic presentation layer'da
```

### Tasarım Prensipler
```
1. ✅ Tutarlılık her şeyden önemli
2. ✅ Accessibility first
3. ✅ Mobile-first design
4. ✅ Dark mode support
5. ✅ Canlı ve enerji dolu renkler
6. ✅ Micro-interactions
7. ✅ Loading states everywhere
8. ✅ Error states everywhere
```

### AI Kullanım Prensipler
```
1. ✅ AI asistan olmalı, karar verici değil
2. ✅ Her AI önerisi review edilmeli
3. ✅ Kullanıcı her zaman kontrolde olmalı
4. ✅ AI maliyetleri track edilmeli
5. ✅ Fallback mekanizması olmalı
6. ✅ Privacy ve data security öncelik
```

### Güvenlik Prensipler
```
1. ✅ Never trust user input
2. ✅ Always validate on server
3. ✅ Use parameterized queries
4. ✅ Implement rate limiting
5. ✅ Log everything (audit trail)
6. ✅ Encrypt sensitive data
7. ✅ KVKK compliance
```

---

## 📚 REFERANS DÖKÜMANLAR

### Proje Dökümanları
```
1. ia-6-proje-analizi.md (Eski proje analizi)
2. proje-planlama-ve-mimari-kararlar.md (Bu döküman)
3. api-documentation.md (Oluşturulacak)
4. component-library.md (Storybook)
5. deployment-guide.md (Oluşturulacak)
```

### Dış Kaynaklar
```
- Clean Architecture (Robert C. Martin)
- Atomic Design (Brad Frost)
- WCAG 2.1 Guidelines
- Next.js Documentation
- Shadcn/ui Documentation
- Supabase Documentation
- OpenAI API Documentation
- Vercel AI SDK Documentation
```

---

## 🎓 ÖĞRENME KAYNAKLARI

### Ekip İçin Önerilen Kaynaklar
```
1. Clean Architecture in TypeScript
2. Atomic Design Methodology
3. Next.js 15 App Router Best Practices
4. Accessibility in React
5. AI Integration Patterns
6. Database Design Best Practices
```

---

## 🔄 VERSİYON TAKİBİ

### v1.0 - MVP (İlk 3 Ay)
```
✅ Multi-program sistemi
✅ Temel modüller (Program, Firma, Danışman, Proje, Eğitim)
✅ Authentication & Authorization
✅ Temel AI özellikleri
✅ Email bildirimleri
```

### v1.1 - Enhanced (Ay 4-5)
```
✅ Etkinlik yönetimi
✅ Randevu sistemi
✅ Zoom entegrasyonu
✅ Chatbot (Tüm paneller)
✅ Gelişmiş raporlama
```

### v1.2 - Advanced AI (Ay 6)
```
✅ Risk analizi
✅ Başarı tahmini
✅ Otomatik workflow'lar
✅ Semantic search
✅ WhatsApp entegrasyonu
```

### v2.0 - Scale (Ay 7+)
```
✅ Mobile app
✅ Advanced analytics
✅ Gamification
✅ Social features
✅ Payment system
✅ API marketplace
```

---

## ✅ ONAYLANAN KARARLAR - ÖZET

### Mimari
- ✅ Clean Architecture + Modular Monolith
- ✅ 6 Katmanlı yapı
- ✅ Loose coupling, High cohesion
- ✅ Domain-driven design

### Tasarım
- ✅ Shadcn/ui + Tailwind CSS
- ✅ Canlı ve renkli palet
- ✅ Atomic Design System
- ✅ Storybook documentation
- ✅ Dark mode support
- ✅ WCAG 2.1 AA compliance

### AI & Otomasyon
- ✅ Hybrid AI (OpenAI GPT-4 + Claude)
- ✅ İçerik AI (Görev, özet, rapor)
- ✅ Analiz AI (Risk, tahmin, trend)
- ✅ Chatbot (Tüm paneller + Public)
- ✅ Otomatik workflow'lar

### Entegrasyonlar
- ✅ Zoom API
- ✅ WhatsApp Business API
- ✅ SendGrid (Email)
- ✅ YouTube (Eğitim videoları)
- ✅ Google Analytics 4 + Mixpanel
- ✅ Sentry (Error tracking)

### Temel Özellikler
- ✅ Multi-Program/Grup sistemi
- ✅ 5 Rol (Master Admin, Program Manager, Consultant, Company Admin, Company User)
- ✅ Program Yöneticisi rolü
- ✅ Danışmanlar birden fazla programa atanabilir
- ✅ Global + Program bazlı eğitimler
- ✅ Dinamik program türleri

---

## 🚀 SONRAKI ADIMLAR

1. ✅ Bu döküman onaylandı
2. ⏳ Geliştirme başlayacak
3. ⏳ Sprint 1: Proje kurulumu
4. ⏳ Sprint 2: Database & Auth
5. ⏳ Sprint 3: UI Foundation

---

**Hazırlayan:** AI Assistant + Ömer Ünsal  
**Tarih:** 28 Ekim 2025  
**Versiyon:** 1.0  
**Durum:** Onaylandı ✅  
**Sonraki Review:** Sprint 5 sonrası (2 hafta sonra)

---

## 📞 İLETİŞİM

Proje ile ilgili sorular, öneriler veya değişiklikler için:
- Bu dökümanı güncelleyin
- Versiyon numarasını artırın
- Değişiklik tarihini ekleyin

---

**NOT:** Bu döküman yaşayan bir döküman olup, proje ilerledikçe güncellenecektir. Her önemli karar ve değişiklik bu dökümana eklenmelidir.

---

🎉 **AKADEMİ PORT PROJESİ BAŞLIYOR!** 🚀

