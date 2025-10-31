# 🎯 Akademi Port

Multi-program e-ihracat dönüşüm platformu - Şirketlerin dijital dönüşüm süreçlerini yöneten kapsamlı proje yönetim sistemi.

## 🚀 Teknoloji Stack

### Frontend
- **Framework:** Next.js 16.0.1 (App Router, Turbopack)
- **Language:** TypeScript 5
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI, Shadcn/ui
- **Form Handling:** React Hook Form + Zod
- **Notifications:** Sonner
- **Icons:** Lucide React

### Backend
- **Database:** PostgreSQL (Supabase)
- **ORM:** Supabase Client
- **Authentication:** Supabase Auth (JWT)
- **API:** Next.js API Routes

### Testing
- **Test Framework:** Vitest
- **Testing Library:** @testing-library/react
- **Coverage:** v8
- **Test Count:** 37 tests passing

### Development Tools
- **Linter:** ESLint 9
- **Formatter:** Prettier
- **Type Checking:** TypeScript
- **Storybook:** Component development

---

## 📁 Proje Yapısı

```
akademi-port/
├── src/
│   ├── 1-presentation/          # UI Layer
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── atoms/       # Basic UI components
│   │   │   │   ├── molecules/   # Composite UI components
│   │   │   │   └── organisms/   # Complex UI sections
│   │   │   └── features/        # Feature-specific components
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # UI utilities
│   │
│   ├── 2-application/           # Application Layer
│   │   └── use-cases/           # Business logic use cases
│   │       ├── project/         # 7 use cases
│   │       ├── sub-project/     # 5 use cases
│   │       ├── task/            # 10 use cases
│   │       └── task-comment/    # 3 use cases
│   │
│   ├── 3-domain/                # Domain Layer
│   │   ├── entities/            # Domain entities (4)
│   │   └── interfaces/
│   │       └── repositories/    # Repository interfaces (4)
│   │
│   ├── 4-infrastructure/        # Infrastructure Layer
│   │   ├── api/
│   │   │   └── helpers/         # API utilities
│   │   └── database/
│   │       ├── migrations/      # SQL migrations (10)
│   │       └── repositories/    # Repository implementations (4)
│   │
│   ├── 5-shared/                # Shared Layer
│   │   ├── constants/           # App constants
│   │   ├── hooks/               # Shared hooks
│   │   ├── lib/                 # Shared utilities
│   │   ├── test/                # Test utilities & mocks
│   │   └── types/               # Shared types
│   │
│   ├── 6-core/                  # Core Layer
│   │   ├── errors.ts            # Error classes
│   │   └── result.ts            # Result pattern
│   │
│   └── app/                     # Next.js App Router
│       ├── api/                 # API routes (20+ endpoints)
│       ├── dashboard/           # Admin dashboard
│       ├── consultant-dashboard/# Consultant dashboard
│       ├── company-dashboard/   # Company dashboard
│       └── login/               # Auth pages
│
├── docs/                        # Documentation
│   ├── API.md                   # API Documentation
│   ├── ARCHITECTURE.md          # Architecture guide
│   ├── DEVELOPER.md             # Developer guide
│   └── USER_GUIDE.md            # User guide
│
├── sprint-detaylari/            # Sprint documentation
└── tests/                       # Test files
```

---

## 🛠️ Kurulum

### 1. Prerequisites

- Node.js v20+
- npm v10+
- Supabase account

### 2. Installation

```bash
# Clone repository
git clone https://github.com/your-org/akademi-port.git
cd akademi-port

# Install dependencies
npm install
```

### 3. Environment Setup

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Migration

Run migrations in Supabase SQL Editor (in order):

```bash
src/4-infrastructure/database/migrations/
├── 01-users.sql
├── 02-programs.sql
├── 03-companies.sql
├── 04-company-users.sql
├── 05-program-assignments.sql
├── 06-program-companies.sql
├── 07-program-participants.sql
├── 08-notifications.sql
├── 009_projects_system_clean.sql
└── 010_performance_indexes.sql
```

### 5. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run tests (watch mode)
npm run test:run         # Run tests once
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report

# Storybook
npm run storybook        # Start Storybook
npm run build-storybook  # Build Storybook
```

---

## 📚 Dokümantasyon

### Core Documentation
- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Developer Guide](./docs/DEVELOPER.md)** - Development setup and guidelines
- **[User Guide](./docs/USER_GUIDE.md)** - End-user documentation

### Sprint Documentation
- [Sprint 1 - Proje Kurulumu](./sprint-detaylari/sprint-01-proje-kurulumu.md)
- [Sprint 4 - Program Yönetimi](./sprint-detaylari/sprint-04-program-yonetimi.md)
- [Sprint 8 - Proje Yönetimi](./sprint-detaylari/sprint-08-proje-yonetimi.md)

### Component Documentation
- [Storybook](http://localhost:6006) - Component library (run `npm run storybook`)

---

## 🏗️ Mimari

Proje **Domain-Driven Design (DDD)** ve **Clean Architecture** prensipleriyle geliştirilmektedir.

### Katmanlar

1. **Presentation Layer** (`1-presentation/`)
   - UI components (atoms, molecules, organisms)
   - Feature-specific components
   - Custom hooks
   - Responsive design

2. **Application Layer** (`2-application/`)
   - Business logic use cases
   - 25 use cases across 4 domains
   - Result pattern for error handling

3. **Domain Layer** (`3-domain/`)
   - Core business entities (4)
   - Repository interfaces (4)
   - Pure TypeScript, no dependencies

4. **Infrastructure Layer** (`4-infrastructure/`)
   - Database repositories (4)
   - API helpers
   - External service integrations
   - 10 database migrations

5. **Shared Layer** (`5-shared/`)
   - Cross-cutting concerns
   - Utilities, constants, types
   - Test utilities and mocks

6. **Core Layer** (`6-core/`)
   - Result pattern
   - Error classes
   - Fundamental patterns

### Design Patterns

- **Repository Pattern:** Abstract data access
- **Result Pattern:** Type-safe error handling
- **Dependency Injection:** Loose coupling
- **Factory Pattern:** Object creation
- **Observer Pattern:** React state management

### Data Flow

```
User → Component → API Route → Use Case → Repository → Database
```

---

## ✨ Özellikler

### Role-Based Dashboards

#### Admin Dashboard
- ✅ Program management
- ✅ Company management
- ✅ User management
- ✅ Project template creation
- ✅ System-wide analytics

#### Consultant Dashboard
- ✅ Program overview
- ✅ Project creation (from templates or scratch)
- ✅ Sub-project management
- ✅ Task assignment
- ✅ Task review and approval
- ✅ Company progress tracking

#### Company Dashboard
- ✅ Assigned projects view
- ✅ Task completion
- ✅ Progress tracking
- ✅ Comments and questions
- ✅ Project timeline view

### Project Management System

- ✅ **Project Templates:** Reusable project structures
- ✅ **Projects:** Full project lifecycle management
- ✅ **Sub-Projects:** Hierarchical project breakdown
- ✅ **Tasks:** Assignment, completion, approval workflow
- ✅ **Comments:** Discussion and Q&A on tasks
- ✅ **Progress Tracking:** Auto-calculated progress
- ✅ **Status Management:** Multi-stage workflow

### Technical Features

- ✅ **Authentication:** Supabase Auth with JWT
- ✅ **Authorization:** Role-based access control
- ✅ **Database:** PostgreSQL with RLS policies
- ✅ **Performance:** 35+ database indexes
- ✅ **Testing:** 37 unit tests, 100% critical path coverage
- ✅ **Responsive:** Mobile-first design
- ✅ **Type-Safe:** Full TypeScript coverage
- ✅ **Error Handling:** Result pattern throughout

---

## 🧪 Testing

### Test Coverage

- **Total Tests:** 37 passing
- **Entity Tests:** 25 tests (4 entities)
- **Use Case Tests:** 12 tests (3 use cases)
- **Coverage:** > 80% for critical paths

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Generate coverage
npm run test:coverage
```

---

## 🎯 Sprint Durumu

### ✅ Tamamlanan Sprintler

#### Sprint 1: Proje Kurulumu
- Next.js 16 + TypeScript
- Tailwind CSS 4 + Shadcn/ui
- 6 katmanlı Clean Architecture
- Storybook + Design tokens
- Result Pattern & Error Classes

#### Sprint 4: Program Yönetimi
- Program CRUD operations
- Company management
- User management
- Role-based dashboards

#### Sprint 8: Proje Yönetimi Sistemi
- **Backend (%100):**
  - 4 Domain entities
  - 4 Repository interfaces & implementations
  - 25 Use cases
  - 20+ API endpoints
  - 2 Database migrations
  - 35+ Performance indexes

- **Frontend (%85):**
  - 13 Pages (Admin, Consultant, Company)
  - 3 UI Components
  - Responsive design
  - Loading/Empty states

- **Testing & Documentation (%100):**
  - 37 Unit tests
  - Test infrastructure (Vitest)
  - API Documentation
  - Architecture Documentation
  - Developer Guide
  - User Guide

### 📋 Sonraki Sprintler

- Sprint 9: Eğitim Yönetimi
- Sprint 10: Raporlama & Analytics
- Sprint 11: Notifications & Real-time
- Sprint 12: File Management
- Sprint 13: Advanced Features

---

## 🔒 Security

- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React auto-escaping)
- ✅ CSRF protection (SameSite cookies)
- ✅ Authentication (Supabase Auth)
- ✅ Authorization (RBAC)
- ✅ RLS policies (database-level security)

---

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] SSL/TLS enabled
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Backup strategy
- [ ] Rate limiting configured

---

## 📈 Performance

### Database
- 35+ performance indexes
- Efficient query optimization
- Connection pooling (Supabase)

### Frontend
- Code splitting (Next.js automatic)
- Image optimization (Next.js Image)
- Lazy loading (dynamic imports)
- Memoization (React.memo, useMemo)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [DEVELOPER.md](./docs/DEVELOPER.md) for detailed guidelines.

---

## 📞 İletişim

**Proje Sahibi:** Ömer Ünsal  
**Geliştirme:** AI Assistant + Ömer Ünsal  
**Email:** dev@akademiport.com

---

## 📝 Lisans

Private Project - All Rights Reserved

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Radix UI for accessible components
- Tailwind CSS for the utility-first CSS

---

<div align="center">

🚀 **Akademi Port - Yeni Nesil E-İhracat Platformu**

Made with ❤️ using Next.js, TypeScript, and Supabase

</div>
