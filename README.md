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

# Format
npm run format

# Type Check
npm run type-check
```

## 📚 Dokümantasyon

- [Mimari Kararlar](./Arşiv/proje-planlama-ve-mimari-kararlar.md)
- [Sprint Planı](./Arşiv/sprint-plani-genel.md)
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
