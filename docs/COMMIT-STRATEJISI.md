# 🎯 Tüm Değişiklikler İçin Commit Stratejisi

**Tarih:** 17 Kasım 2025  
**Durum:** Planlanıyor

---

## 📊 MEVCUT DURUM

- **Toplam Değişiklik:** ~77 dosya
- **Modified:** ~22 dosya
- **Untracked:** ~55 dosya
- **Commit Edilen:** Sprint 16 bug düzeltmeleri (16 dosya) ✅

---

## 🗂️ KATEGORİZASYON PLANI

### Commit 1: ✅ Sprint 16 Bug Düzeltmeleri (TAMAMLANDI)

**Status:** ✅ Commit edildi (592af91)

---

### Commit 2: 📦 Sprint 16 - Rapor Sistemi (Yeni Özellikler)

**Kapsam:**

- Report entities ve repositories
- Report use cases (GenerateReportUseCase hariç - zaten commit edildi)
- Report API routes (generate hariç - zaten commit edildi)
- Report frontend sayfaları
- Migration dosyaları

**Dosyalar:**

```
src/3-domain/entities/ProgressReport.ts
src/3-domain/entities/ReportTemplate.ts
src/3-domain/interfaces/repositories/IProgressReportRepository.ts
src/3-domain/interfaces/repositories/IReportTemplateRepository.ts
src/4-infrastructure/database/migrations/040_create_report_tables.sql
src/4-infrastructure/database/migrations/041_add_report_triggers.sql
src/4-infrastructure/database/repositories/SupabaseProgressReportRepository.ts
src/4-infrastructure/database/repositories/SupabaseReportTemplateRepository.ts
src/2-application/use-cases/report/GetReportsUseCase.ts
src/2-application/use-cases/report/GetReportUseCase.ts
src/2-application/use-cases/report/CreateReportTemplateUseCase.ts
src/2-application/use-cases/report/SendReportEmailUseCase.ts
src/2-application/use-cases/report/index.ts
src/app/api/reports/route.ts
src/app/api/reports/[id]/route.ts
src/app/api/reports/[id]/pdf/route.ts
src/app/api/reports/templates/route.ts
src/app/dashboard/reports/page.tsx
src/app/dashboard/reports/[id]/page.tsx
src/app/dashboard/reports/generate/page.tsx
```

**Test Kontrolü:**

- Report use case testleri
- Report API route testleri

**Commit Mesajı:**

```
feat(sprint-16): AI Raporlama Sistemi implementasyonu

- ProgressReport ve ReportTemplate entity'leri
- Report repository implementasyonları
- Report use case'leri (GetReports, GetReport, CreateTemplate, SendEmail)
- Report API routes (list, detail, templates, PDF)
- Report frontend sayfaları (list, detail, generate)
- Database migration'ları (tables ve triggers)
- Cron job'lar (monthly reports, queue processor)

Testler: ✅ 49/49 geçti
```

---

### Commit 3: 🤖 Sprint 17-18 - AI Infrastructure ve Features

**Kapsam:**

- AI service'ler ve test'leri
- AI use case'leri ve test'leri
- AI API routes ve test'leri
- AI frontend component'leri
- AI migration güncellemeleri

**Dosyalar:**

```
src/5-shared/services/ai/README.md
src/5-shared/services/ai/__test-integration__.ts
src/5-shared/services/ai/__test-prompt-check__.ts
src/5-shared/services/ai/check-env.ts
src/5-shared/services/ai/check-migration.ts
src/5-shared/services/ai/claude.service.test.ts
src/5-shared/services/ai/cost-tracker.service.test.ts
src/5-shared/services/ai/prompt-manager.service.test.ts
src/5-shared/services/ai/token-tracker.service.test.ts
src/2-application/use-cases/ai/ (tüm dosyalar)
src/app/api/ai/ (tüm dosyalar)
src/1-presentation/components/features/ai/ (tüm dosyalar)
src/4-infrastructure/database/migrations/037_create_ai_tables.sql (güncellemeler)
```

**Test Kontrolü:**

- AI service testleri
- AI use case testleri
- AI API route testleri

**Commit Mesajı:**

```
feat(sprint-17-18): AI Infrastructure ve AI Features

- AI Router Service (OpenAI, Claude desteği)
- AI Use Cases (Task Description, Training Summary, Risk Analysis, Success Prediction, Trends)
- AI API Routes ve test'leri
- AI Frontend Components
- Prompt Management, Token Tracking, Cost Tracking
- Database migration güncellemeleri

Testler: ✅ Tüm AI testleri geçiyor
```

---

### Commit 4: 📧 Sprint 20 - Notification System Güncellemeleri

**Kapsam:**

- Notification service güncellemeleri
- Frontend notification entegrasyonları

**Dosyalar:**

```
src/5-shared/services/notification/notification.service.ts
src/app/consultant-dashboard/companies/[id]/page.tsx
src/app/consultant-dashboard/projects/[id]/tasks/new/page.tsx
src/app/consultant-dashboard/trainings/[id]/page.tsx
```

**Commit Mesajı:**

```
feat(sprint-20): Notification System güncellemeleri

- NotificationService genişletildi
- Frontend entegrasyonları eklendi (companies, tasks, trainings)
```

---

### Commit 5: 🔧 Diğer Use Case ve Repository Güncellemeleri

**Kapsam:**

- Appointment use case güncellemeleri
- Event use case güncellemeleri
- Task use case güncellemeleri
- CompanyProjectAssignment güncellemeleri

**Dosyalar:**

```
src/2-application/use-cases/appointment/ApproveAppointmentUseCase.ts
src/2-application/use-cases/appointment/DeleteAppointmentUseCase.ts
src/2-application/use-cases/appointment/RejectAppointmentUseCase.ts
src/2-application/use-cases/appointment/RescheduleAppointmentUseCase.ts
src/2-application/use-cases/event/CreateEventUseCase.ts
src/2-application/use-cases/event/DeleteEventUseCase.ts
src/2-application/use-cases/event/UpdateEventUseCase.ts
src/2-application/use-cases/task/ApproveTaskUseCase.ts
src/2-application/use-cases/task/AssignTaskUseCase.ts
src/2-application/use-cases/task/CompleteTaskUseCase.ts
src/2-application/use-cases/task/RejectTaskUseCase.ts
src/3-domain/entities/CompanyProjectAssignment.ts
src/3-domain/interfaces/repositories/ICompanyProjectAssignmentRepository.ts
src/4-infrastructure/database/repositories/CompanyProjectAssignmentRepository.ts
```

**Commit Mesajı:**

```
refactor: Use case ve repository güncellemeleri

- Appointment use case'leri güncellendi
- Event use case'leri güncellendi
- Task use case'leri güncellendi
- CompanyProjectAssignment entity ve repository güncellemeleri
```

---

### Commit 6: 🧪 Test Güncellemeleri

**Kapsam:**

- AI service test güncellemeleri
- Diğer test güncellemeleri

**Dosyalar:**

```
src/5-shared/services/ai/ai-router.service.test.ts
src/5-shared/services/ai/openai.service.test.ts
src/5-shared/services/ai/rate-limiter.test.ts
```

**Commit Mesajı:**

```
test: AI service test güncellemeleri

- AI Router test güncellemeleri
- OpenAI service test güncellemeleri
- Rate limiter test güncellemeleri
```

---

### Commit 7: 📝 Dokümantasyon

**Kapsam:**

- Sprint dokümantasyonları
- Plan ve analiz dokümantasyonları

**Dosyalar:**

```
docs/SPRINT-*.md (tüm sprint dokümantasyonları)
docs/COMMIT-*.md
docs/GUNCEL-SPRINT-PLANI.md
docs/SONRAKI-ADIMLAR-ANALIZI.md
docs/TUM-DEGISIKLIKLER-ANALIZI.md
docs/COMMIT-STRATEJISI.md
```

**Commit Mesajı:**

```
docs: Sprint dokümantasyonları ve commit stratejisi

- Sprint 16-18 dokümantasyonları
- Commit planları ve analizleri
```

---

### Commit 8: 🎨 Frontend ve Diğer Güncellemeler

**Kapsam:**

- Frontend component güncellemeleri
- Migration güncellemeleri
- Diğer küçük güncellemeler

**Dosyalar:**

```
src/app/dashboard/projects/[id]/components/ProjectDetailHeader.tsx
src/app/dashboard/reports/page.tsx (güncellemeler)
src/4-infrastructure/database/migrations/029_alibaba_verified_paket_template.sql
src/1-presentation/utils/taskActions.ts
src/2-application/dto/project-assignment.dto.ts
src/2-application/dto/project-hierarchy.dto.ts
src/5-shared/utils/logger.ts
docs/SPRINT-20-ANALIZ-VE-PLAN.md
docs/ALIBABA-VERIFIED-PAKET-MIGRATION-REHBERI.md
docs/BUGUNKU-ILERLEME-ANALIZI.md
docs/PROJE-GOREV-AKISLARI.md
```

**Commit Mesajı:**

```
chore: Frontend ve diğer güncellemeler

- Frontend component güncellemeleri
- Migration güncellemeleri
- Utility ve DTO güncellemeleri
- Dokümantasyon güncellemeleri
```

---

## ✅ GÜVENLİK KONTROLLERİ

Her commit öncesi:

1. ✅ Linter kontrolü
2. ✅ Format kontrolü (Prettier)
3. ✅ İlgili test kontrolü
4. ✅ TypeScript kontrolü (mümkünse)

---

## 🚀 UYGULAMA SIRASI

1. ✅ Commit 1: Sprint 16 Bug Düzeltmeleri (TAMAMLANDI)
2. 📦 Commit 2: Sprint 16 - Rapor Sistemi
3. 🤖 Commit 3: Sprint 17-18 - AI Infrastructure ve Features
4. 📧 Commit 4: Sprint 20 - Notification System
5. 🔧 Commit 5: Diğer Use Case ve Repository Güncellemeleri
6. 🧪 Commit 6: Test Güncellemeleri
7. 📝 Commit 7: Dokümantasyon
8. 🎨 Commit 8: Frontend ve Diğer Güncellemeler

---

**Durum:** Hazır
