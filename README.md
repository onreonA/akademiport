# 🎯 Akademi Port

Multi-program e-ihracat dönüşüm platformu.

## 🚀 Teknoloji Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (JWT)
- **AI:** OpenAI GPT-4, Anthropic Claude
- **Documentation:** Storybook

## 📁 Proje Yapısı

```
src/
├── 1-presentation/    # UI Layer
├── 2-application/     # Business Logic Layer
├── 3-domain/          # Domain Layer
├── 4-infrastructure/  # Infrastructure Layer
├── 5-shared/          # Shared Layer
└── 6-core/            # Core Layer
```

## 🛠️ Kurulum

```bash
# 1. Dependencies
npm install

# 2. Environment Variables
cp .env.local.example .env.local
# .env.local dosyasını Supabase bilgilerinizle doldurun

# 3. Database Migration
# Supabase Dashboard → SQL Editor'de çalıştırın:
# src/4-infrastructure/database/migrations/combined_initial_schema.sql

# 4. Development
npm run dev

# 5. Storybook
npm run storybook
```

## 📝 Scripts

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run lint:fix     # ESLint fix
npm run format       # Prettier format
npm run type-check   # TypeScript check
npm run storybook    # Storybook dev
```

## 📚 Dokümantasyon

- [API Documentation](./docs/API.md)
- [Sprint 2 Summary](./docs/SPRINT-2-SUMMARY.md)
- [Database README](./src/4-infrastructure/database/README.md)
- [Storybook](http://localhost:6006) (npm run storybook)
- [Sprint 1 Detayları](./sprint-detaylari/sprint-01-proje-kurulumu.md)
- [Component Library](http://localhost:6006) (Storybook - yakında)

## 🎨 Design System

Design system Storybook'ta dokümante edilecektir.

```bash
npm run storybook
```

## 🏗️ Mimari

Proje **Clean Architecture** ve **Modular Monolith** prensipleriyle geliştirilmektedir.

### Katmanlar

1. **Presentation Layer** - UI components ve pages
2. **Application Layer** - Business logic ve use cases
3. **Domain Layer** - Core business entities ve interfaces
4. **Infrastructure Layer** - Database, API, external services
5. **Shared Layer** - Utilities, constants, hooks
6. **Core Layer** - Framework-level kod (errors, result pattern)

### Prensipler

- **Loose Coupling** - Modüller birbirine bağımlı değil
- **High Cohesion** - Her katman kendi işine odaklı
- **Dependency Rule** - Bağımlılıklar tek yönlü (dışarıdan içeriye)
- **Vertical Slice** - Her özellik baştan sona tamamlanır

## 📝 Geliştirme Kuralları

- TypeScript strict mode aktif
- ESLint kurallarına uyulmalı
- Prettier ile format edilmeli
- Her katman için README.md olmalı
- Component'ler Storybook'ta dokümante edilmeli

## 🎯 Sprint Durumu

**Tamamlanan Sprint:** Sprint 1 - Proje Kurulumu  
**Durum:** ✅ Tamamlandı  
**Tamamlanma:** %100

### Tamamlanan Görevler

- ✅ Next.js 16 + TypeScript kurulumu
- ✅ Tailwind CSS 4 + Shadcn/ui kurulumu
- ✅ ESLint + Prettier konfigürasyonu
- ✅ 6 katmanlı Clean Architecture
- ✅ Storybook kurulumu ve dokümantasyon
- ✅ Design tokens sistemi (88 renk, typography, spacing, shadows, gradients)
- ✅ Result Pattern & Error Classes
- ✅ 5 UI Component (Button, Input, Card, Badge, Avatar)
- ✅ Dark mode support
- ✅ Git repository ve version control

### Sonraki Sprint

- 📋 Sprint 2: Database & Auth (Supabase, Authentication, Migration)

## 📞 İletişim

**Proje Sahibi:** Ömer Ünsal  
**Geliştirme:** AI Assistant + Ömer Ünsal

## 📝 Lisans

Private Project

---

🚀 **Akademi Port - Yeni Nesil E-İhracat Platformu**
