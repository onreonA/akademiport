# 📋 Sprint 11: Randevu Yönetimi - Detaylı Analiz ve Plan

**Tarih:** 30 Ekim 2025  
**Sprint:** 11 / 23  
**Hedef:** Danışman-Firma randevu sistemi çalışıyor  
**Bağımlılıklar:** Sprint 7 (Consultant Management), Sprint 10 (Event Management)

---

## 🎯 Sprint Hedefi

**Ana Hedef:** Consultant-Company arasında randevu sistemi kurmak ve yönetmek.

**Temel Özellikler:**

- Consultant müsaitlik takvimi yönetimi
- Company randevu talep etme
- Consultant randevu onaylama/reddetme
- Randevu revize (reschedule) sistemi
- Zoom meeting otomatik oluşturma
- Otomatik hatırlatmalar
- Katılım takibi

---

## 📊 Mevcut Durum Analizi

### ✅ Hazır Olan Altyapı (Sprint 10'dan)

#### 1. Zoom API Entegrasyonu

- ✅ `ZoomApiService` hazır ve çalışıyor
- ✅ Meeting oluşturma/güncelleme/silme metodları var
- ✅ Hata yönetimi iyileştirilmiş

#### 2. Notification Service

- ✅ `NotificationService` hazır
- ✅ Email gönderimi çalışıyor
- ✅ Event reminder sistemi mevcut (adapt edilebilir)

#### 3. Calendar Infrastructure

- ✅ `UnifiedCalendar` component hazır
- ✅ `calendar.utils.ts` utility fonksiyonları var
- ✅ FullCalendar v6 entegrasyonu çalışıyor

#### 4. Cron Job Sistemi

- ✅ Vercel Cron Jobs yapılandırılmış
- ✅ Event reminder cron job örneği mevcut

#### 5. Database Patterns

- ✅ Event sistemi için migration pattern'i hazır
- ✅ Soft delete pattern'i kullanılıyor
- ✅ RLS policies pattern'i mevcut

---

## 🏗️ Mimari Tasarım

### Event vs Appointment Karşılaştırması

| Özellik        | Event (Sprint 10)                | Appointment (Sprint 11)               |
| -------------- | -------------------------------- | ------------------------------------- |
| **Kapsam**     | Program bazlı, genel etkinlikler | Consultant-Company birebir            |
| **Katılımcı**  | Çoklu (programdaki tüm firmalar) | İkili (Consultant + Company)          |
| **Onay**       | Gerekmez (otomatik oluşturulur)  | Gerekir (pending → approved/rejected) |
| **Reschedule** | Var (update)                     | Var + özel reschedule flow'u          |
| **Zoom**       | Otomatik oluşturulur             | Onaylandıktan sonra oluşturulur       |
| **Müsaitlik**  | N/A                              | Consultant müsaitlik takvimi gerekli  |
| **Talep**      | Admin/Consultant oluşturur       | Company talep eder                    |

### Domain Model

```
Appointment
├── id: UUID
├── consultantId: UUID (FK → users)
├── companyId: UUID (FK → companies)
├── programId: UUID (FK → programs) [optional, program bazlı randevular için]
├── title: string
├── description?: string
├── startTime: DateTime
├── endTime: DateTime
├── timezone: string
├── status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
├── requestedBy: UUID (FK → users) [Company user]
├── requestedAt: DateTime
├── approvedAt?: DateTime
├── approvedBy?: UUID (FK → users) [Consultant]
├── rescheduledFrom?: UUID (FK → appointments) [Reschedule chain]
├── zoomMeetingId?: string
├── zoomJoinUrl?: string
├── zoomStartUrl?: string
├── zoomPassword?: string
├── notes?: string [Consultant notları]
├── companyNotes?: string [Company notları]
├── attendedAt?: DateTime
├── createdAt: DateTime
├── updatedAt: DateTime
├── deletedAt?: DateTime
```

### Status Flow

```
pending → approved → completed
   ↓         ↓
rejected  cancelled
   ↓
rescheduled (yeni appointment oluşturulur)
```

---

## 📦 Oluşturulacak Dosyalar

### Faz A: Domain Layer (3 dosya)

```
src/3-domain/
├── entities/
│   └── Appointment.ts                    (~150 satır)
├── enums/
│   └── AppointmentStatus.ts              (~10 satır)
└── interfaces/repositories/
    └── IAppointmentRepository.ts         (~80 satır)
```

**Appointment Entity Özellikleri:**

- Status enum (pending, approved, rejected, completed, cancelled)
- Reschedule chain tracking
- Zoom meeting bilgileri
- Consultant ve Company notları ayrı

**IAppointmentRepository Metodları:**

- `findById(id: string): Promise<Appointment | null>`
- `findByConsultantId(consultantId: string, filters?): Promise<Appointment[]>`
- `findByCompanyId(companyId: string, filters?): Promise<Appointment[]>`
- `findByProgramId(programId: string, filters?): Promise<Appointment[]>`
- `findByStatus(status: AppointmentStatus, filters?): Promise<Appointment[]>`
- `findConflictingAppointments(consultantId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<Appointment[]>`
- `create(appointment: CreateAppointmentDto): Promise<Appointment>`
- `update(id: string, data: UpdateAppointmentDto): Promise<Appointment>`
- `delete(id: string): Promise<void>`
- `approve(id: string, approvedBy: string, notes?: string): Promise<Appointment>`
- `reject(id: string, rejectedBy: string, reason?: string): Promise<Appointment>`
- `reschedule(id: string, newStartTime: Date, newEndTime: Date, rescheduledBy: string): Promise<{ old: Appointment; new: Appointment }>`

---

### Faz B: Infrastructure Layer (2 dosya)

```
src/4-infrastructure/
├── database/
│   ├── migrations/
│   │   └── 032_appointments_system.sql   (~250 satır)
│   └── repositories/
│       └── AppointmentRepository.ts      (~400 satır)
```

**Migration İçeriği:**

- `appointments` tablosu
- `appointment_status` enum
- Index'ler (consultant_id, company_id, start_time, status)
- RLS policies (Consultant kendi randevularını, Company kendi randevularını görebilir)
- Foreign key constraints
- Soft delete support

**AppointmentRepository:**

- Supabase integration
- Conflict detection (müsaitlik kontrolü)
- Reschedule chain tracking
- Status transition validation

---

### Faz C: Application Layer (8 dosya, ~1200 satır)

```
src/2-application/
├── dto/appointment/
│   ├── AppointmentDto.ts                 (~100 satır)
│   ├── CreateAppointmentDto.ts           (~80 satır)
│   ├── UpdateAppointmentDto.ts           (~80 satır)
│   ├── AppointmentFilterDto.ts           (~60 satır)
│   └── index.ts                          (~10 satır)
└── use-cases/appointment/
    ├── CreateAppointmentUseCase.ts        (~150 satır)
    ├── GetAppointmentUseCase.ts           (~80 satır)
    ├── ListAppointmentsUseCase.ts         (~120 satır)
    ├── UpdateAppointmentUseCase.ts        (~120 satır)
    ├── DeleteAppointmentUseCase.ts        (~80 satır)
    ├── ApproveAppointmentUseCase.ts      (~150 satır)
    ├── RejectAppointmentUseCase.ts        (~120 satır)
    ├── RescheduleAppointmentUseCase.ts   (~200 satır)
    └── index.ts                           (~20 satır)
```

**Use Cases Özellikleri:**

1. **CreateAppointmentUseCase:**
   - Company user randevu talep eder
   - Consultant müsaitlik kontrolü yapılır
   - Conflict detection
   - Status: `pending`

2. **ApproveAppointmentUseCase:**
   - Consultant randevuyu onaylar
   - Zoom meeting otomatik oluşturulur
   - Email notification gönderilir
   - Status: `approved`

3. **RejectAppointmentUseCase:**
   - Consultant randevuyu reddeder
   - Email notification gönderilir
   - Status: `rejected`

4. **RescheduleAppointmentUseCase:**
   - Eski appointment `cancelled` olur
   - Yeni appointment `pending` olarak oluşturulur
   - `rescheduledFrom` link'i kurulur
   - Email notification gönderilir

5. **ListAppointmentsUseCase:**
   - Role-based filtering (Consultant kendi randevularını, Company kendi randevularını)
   - Status filtering
   - Date range filtering
   - Pagination

---

### Faz D: API Layer (5 dosya, ~600 satır)

```
src/app/api/appointments/
├── route.ts                              (~150 satır) [GET, POST]
├── [id]/
│   ├── route.ts                          (~200 satır) [GET, PATCH, DELETE]
│   ├── approve/route.ts                   (~100 satır) [POST]
│   ├── reject/route.ts                    (~100 satır) [POST]
│   └── reschedule/route.ts                (~150 satır) [POST]
```

**API Endpoints:**

- `GET /api/appointments` - List appointments (role-based)
- `POST /api/appointments` - Create appointment (Company only)
- `GET /api/appointments/[id]` - Get appointment details
- `PATCH /api/appointments/[id]` - Update appointment (limited fields)
- `DELETE /api/appointments/[id]` - Cancel appointment
- `POST /api/appointments/[id]/approve` - Approve appointment (Consultant only)
- `POST /api/appointments/[id]/reject` - Reject appointment (Consultant only)
- `POST /api/appointments/[id]/reschedule` - Reschedule appointment

**Authorization:**

- Company: Sadece kendi randevularını görebilir/oluşturabilir
- Consultant: Sadece kendi randevularını görebilir/onaylayabilir
- Admin: Tüm randevuları görebilir

---

### Faz E: Frontend - Shared Hooks (2 dosya, ~100 satır)

```
src/5-shared/hooks/api/
├── useAppointments.ts                    (~50 satır)
└── useAppointment.ts                     (~50 satır)
```

**React Query Hooks:**

- `useAppointments(filters)` - List appointments
- `useAppointment(id)` - Get single appointment
- Mutations: `useCreateAppointment`, `useApproveAppointment`, `useRejectAppointment`, `useRescheduleAppointment`

---

### Faz F: Frontend - Consultant Panel (4 dosya, ~800 satır)

```
src/app/consultant-dashboard/appointments/
├── page.tsx                              (~200 satır) [List + Calendar view]
└── [id]/
    └── page.tsx                          (~150 satır) [Detail + Actions]

src/1-presentation/components/features/appointments/
├── AppointmentList.tsx                   (~150 satır)
├── AppointmentDetail.tsx                  (~200 satır)
├── AvailabilityCalendar.tsx               (~200 satır) [Müsaitlik takvimi]
└── AppointmentActions.tsx                 (~100 satır) [Approve/Reject/Reschedule]
```

**Consultant Özellikleri:**

- Pending appointments listesi
- Appointment detail sayfası
- Approve/Reject butonları
- Reschedule formu
- Availability calendar (müsaitlik takvimi)
- Zoom link görüntüleme

---

### Faz G: Frontend - Company Panel (3 dosya, ~600 satır)

```
src/app/company-dashboard/appointments/
├── page.tsx                              (~200 satır) [List + Request form]
└── [id]/
    └── page.tsx                          (~150 satır) [Detail]

src/1-presentation/components/features/appointments/
├── AppointmentRequestForm.tsx             (~200 satır) [Yeni randevu talep formu]
└── AppointmentStatusBadge.tsx             (~50 satır) [Status badge component]
```

**Company Özellikleri:**

- Randevu listesi (status bazlı)
- Yeni randevu talep formu
- Appointment detail sayfası
- Status tracking (pending → approved/rejected)
- Zoom link görüntüleme

---

### Faz H: Cron Jobs & Reminders (2 dosya, ~200 satır)

```
src/app/api/cron/
└── send-appointment-reminders/route.ts   (~150 satır)

src/2-application/use-cases/appointment/
└── SendAppointmentRemindersUseCase.ts     (~150 satır)
```

**Reminder Sistemi:**

- 24 saat önce hatırlatma
- 1 saat önce hatırlatma
- Email notification
- Zoom link dahil

---

## 🔄 İş Akışları (User Flows)

### Flow 1: Company Randevu Talep Eder

```
1. Company user → /company-dashboard/appointments
2. "Yeni Randevu Talep Et" butonuna tıklar
3. AppointmentRequestForm açılır:
   - Consultant seçimi (program bazlı)
   - Tarih/saat seçimi
   - Açıklama (opsiyonel)
4. Form submit → POST /api/appointments
5. CreateAppointmentUseCase:
   - Müsaitlik kontrolü
   - Conflict detection
   - Appointment oluşturulur (status: pending)
6. Email notification → Consultant'a gönderilir
7. UI'da "Pending" status gösterilir
```

### Flow 2: Consultant Randevu Onaylar

```
1. Consultant → /consultant-dashboard/appointments
2. Pending appointments listesinde randevu görür
3. Randevuya tıklar → Detail sayfası
4. "Onayla" butonuna tıklar
5. POST /api/appointments/[id]/approve
6. ApproveAppointmentUseCase:
   - Status: approved
   - Zoom meeting oluşturulur
   - Email notification → Company'ye gönderilir
7. UI'da "Approved" status + Zoom link gösterilir
```

### Flow 3: Consultant Randevu Reddeder

```
1. Consultant → Appointment detail sayfası
2. "Reddet" butonuna tıklar
3. Rejection reason modal açılır
4. POST /api/appointments/[id]/reject
5. RejectAppointmentUseCase:
   - Status: rejected
   - Email notification → Company'ye gönderilir
6. UI'da "Rejected" status gösterilir
```

### Flow 4: Randevu Revize (Reschedule)

```
1. Consultant veya Company → Appointment detail sayfası
2. "Revize Et" butonuna tıklar
3. Reschedule form açılır:
   - Yeni tarih/saat seçimi
   - Müsaitlik kontrolü
4. POST /api/appointments/[id]/reschedule
5. RescheduleAppointmentUseCase:
   - Eski appointment: status → cancelled
   - Yeni appointment: status → pending (veya approved, eğer Consultant reschedule ediyorsa)
   - rescheduledFrom link'i kurulur
   - Email notification gönderilir
6. UI'da yeni appointment gösterilir
```

---

## 🎨 UI/UX Tasarım Prensipleri

### Consultant Panel

**Appointments List:**

- Tabs: "Pending", "Approved", "Completed", "All"
- Her randevu için:
  - Company adı
  - Tarih/saat
  - Status badge
  - Quick actions (Approve/Reject/Reschedule)
- Calendar view toggle
- Filter: Date range, status

**Availability Calendar:**

- FullCalendar ile müsaitlik takvimi
- Müsait saatleri işaretleme
- Mevcut randevuları görüntüleme
- Conflict detection görselleştirme

### Company Panel

**Appointments List:**

- Tabs: "Pending", "Approved", "Rejected", "All"
- Her randevu için:
  - Consultant adı
  - Tarih/saat
  - Status badge
  - Zoom link (approved ise)
- "Yeni Randevu Talep Et" butonu

**Request Form:**

- Consultant seçimi (dropdown)
- Date/time picker
- Description textarea
- Müsaitlik kontrolü (real-time)
- Submit butonu

---

## 🔐 Güvenlik ve Yetkilendirme

### RLS Policies

```sql
-- Consultant: Sadece kendi randevularını görebilir
CREATE POLICY "Consultants can view own appointments"
ON appointments FOR SELECT
USING (consultant_id = auth.uid() AND user_role = 'consultant');

-- Company: Sadece kendi randevularını görebilir
CREATE POLICY "Companies can view own appointments"
ON appointments FOR SELECT
USING (company_id IN (
  SELECT company_id FROM users WHERE id = auth.uid()
));

-- Company: Randevu oluşturabilir
CREATE POLICY "Companies can create appointments"
ON appointments FOR INSERT
WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  AND requested_by = auth.uid()
);

-- Consultant: Randevu onaylayabilir/reddedebilir
CREATE POLICY "Consultants can approve/reject appointments"
ON appointments FOR UPDATE
USING (consultant_id = auth.uid() AND user_role = 'consultant');
```

### API Authorization

- `POST /api/appointments`: Sadece Company users
- `POST /api/appointments/[id]/approve`: Sadece Consultant (randevunun consultant'ı)
- `POST /api/appointments/[id]/reject`: Sadece Consultant (randevunun consultant'ı)
- `POST /api/appointments/[id]/reschedule`: Consultant veya Company (kendi randevuları)

---

## 📈 Performans Optimizasyonları

1. **Index'ler:**
   - `consultant_id`, `company_id`, `start_time`, `status` üzerinde index'ler
   - Composite index: `(consultant_id, start_time)` conflict detection için

2. **Caching:**
   - React Query ile appointment listesi cache'lenir
   - Availability calendar cache'lenir

3. **Pagination:**
   - Appointment listesi paginated
   - Default: 20 per page

---

## 🧪 Test Senaryoları

### Unit Tests

1. **CreateAppointmentUseCase:**
   - Conflict detection testi
   - Müsaitlik kontrolü testi
   - Validation testi

2. **ApproveAppointmentUseCase:**
   - Zoom meeting oluşturma testi
   - Email notification testi
   - Status transition testi

3. **RescheduleAppointmentUseCase:**
   - Eski appointment cancellation testi
   - Yeni appointment oluşturma testi
   - Chain tracking testi

### Integration Tests

1. **API Routes:**
   - Authorization testleri
   - Status transition testleri
   - Conflict detection testleri

2. **Frontend Components:**
   - AppointmentList rendering
   - AppointmentRequestForm validation
   - AppointmentActions button states

---

## 📋 İmplementasyon Sırası

### Faz 1: Backend Foundation (1-2 gün)

1. ✅ Domain layer (Entity, Enum, Repository Interface)
2. ✅ Database migration
3. ✅ Infrastructure layer (Repository implementation)

### Faz 2: Application Layer (2 gün)

1. ✅ DTOs
2. ✅ Use Cases (CRUD + Approve/Reject/Reschedule)

### Faz 3: API Layer (1 gün)

1. ✅ API routes
2. ✅ Authorization
3. ✅ Error handling

### Faz 4: Frontend - Consultant Panel (2 gün)

1. ✅ Appointment list component
2. ✅ Appointment detail component
3. ✅ Approve/Reject/Reschedule actions
4. ✅ Availability calendar

### Faz 5: Frontend - Company Panel (1-2 gün)

1. ✅ Appointment list component
2. ✅ Appointment request form
3. ✅ Appointment detail component

### Faz 6: Reminders & Polish (1 gün)

1. ✅ Cron job for reminders
2. ✅ Email templates
3. ✅ UI polish
4. ✅ Error handling improvements

**Toplam Tahmini Süre:** 8-10 gün

---

## ✅ Kabul Kriterleri

- [ ] Company randevu talep edebiliyor
- [ ] Consultant randevu onaylayabiliyor/reddedebiliyor
- [ ] Randevu revize edilebiliyor
- [ ] Müsaitlik kontrolü çalışıyor (conflict detection)
- [ ] Zoom meeting otomatik oluşturuluyor (onaylandığında)
- [ ] Otomatik hatırlatmalar gidiyor (24 saat önce, 1 saat önce)
- [ ] Consultant müsaitlik takvimi görüntülenebiliyor
- [ ] Company randevu listesi görüntülenebiliyor
- [ ] Status transitions doğru çalışıyor
- [ ] Authorization doğru çalışıyor

---

## 🚀 Başlangıç

**Önerilen Başlangıç Sırası:**

1. Domain layer (Entity + Enum + Repository Interface)
2. Database migration
3. Infrastructure layer (Repository)
4. Application layer (DTOs + Use Cases)
5. API layer
6. Frontend (Consultant panel)
7. Frontend (Company panel)
8. Reminders & polish

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Son Güncelleme:** 30 Ekim 2025
