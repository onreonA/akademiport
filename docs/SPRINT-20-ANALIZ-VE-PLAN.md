# 🔔 Sprint 20: Notification System - Detaylı Analiz ve Plan

**Tarih:** 15 Ocak 2025  
**Sprint:** 20 / 28  
**Durum:** 📋 Planlama Aşaması  
**Öncelik:** 🔴 Yüksek (Kullanıcı deneyimi için kritik)  
**Süre:** 1 hafta (~8 saat)

---

## 🎯 Sprint Hedefi

**Ana Hedef:** Kapsamlı bildirim sistemi oluşturmak (in-app, email, push notifications).

**Alt Hedefler:**

1. ✅ In-app notifications database tablosu
2. ✅ Real-time notification updates (Supabase Realtime)
3. ✅ Email notifications entegrasyonu (Sprint 24 Email Service)
4. ✅ Push notifications (Web Push API)
5. ✅ Notification preferences yönetimi
6. ✅ Notification center UI component
7. ✅ Notification service layer
8. ✅ Notification triggers (task, event, appointment, vb.)

---

## 📊 Mevcut Durum Analizi

### ✅ Tamamlanmış Altyapı

- ✅ Database & Auth (Sprint 2)
- ✅ Email System (Sprint 24) - SendGrid entegrasyonu hazır
- ✅ Clean Architecture yapısı
- ✅ Supabase client (Realtime desteği mevcut)
- ✅ `notification_type` enum tanımlı
- ✅ `users.settings` içinde notification preferences var
- ✅ `forum_notifications` tablosu var (Sprint 13)

### ❌ Eksik Özellikler

- ❌ Genel `notifications` tablosu yok
- ❌ Real-time notification updates yok
- ❌ Push notification sistemi yok
- ❌ Notification service layer eksik
- ❌ Notification center UI yok
- ❌ Notification triggers yok
- ❌ Email Service entegrasyonu eksik (NotificationService'te)

### 📋 Mevcut Notification İhtiyaçları

**Sprint 13'ten kalan:**

- Forum notifications (mevcut, `forum_notifications` tablosu)

**Sprint 20'de eklenmesi gerekenler:**

- Task notifications (assigned, completed, deadline)
- Event notifications (reminder, cancelled)
- Appointment notifications (confirmed, cancelled, reminder)
- Project notifications (assigned, updated)
- Training notifications (assigned, completed)
- System notifications (info, warning, error)
- E-commerce metrics reminders (Sprint 15)

---

## 🏗️ Mimari Tasarım

### Database Schema

```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification content
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- URL to navigate when clicked

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data (task_id, event_id, etc.)
  priority notification_priority DEFAULT 'normal',

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Channels
  channels notification_channel[] DEFAULT ARRAY['in_app']::notification_channel[],
  email_sent BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Auto-delete after expiration

  -- Indexes
  CONSTRAINT valid_action_url CHECK (action_url IS NULL OR action_url ~* '^https?://')
);

-- Notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,

  -- Type preferences (JSONB: { type: { email: boolean, push: boolean, in_app: boolean } })
  type_preferences JSONB DEFAULT '{}'::jsonb,

  -- Quiet hours
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_enabled BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push subscription table (for Web Push API)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Web Push subscription data
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,

  -- Metadata
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, endpoint)
);

-- New enums
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE notification_channel AS ENUM (
  'in_app',
  'email',
  'push',
  'sms' -- Future support
);
```

### Domain Layer

**Entities:**

- `Notification` - Notification entity
- `NotificationPreferences` - User preferences
- `PushSubscription` - Web Push subscription

**Enums:**

- `NotificationType` - Extend existing enum
- `NotificationPriority` - Priority levels
- `NotificationChannel` - Delivery channels
- `NotificationStatus` - Read/unread status

**Interfaces:**

- `INotificationService` - Core notification service
- `IPushNotificationService` - Push notification service
- `INotificationRepository` - Database operations

### Application Layer

**Use Cases:**

- `CreateNotificationUseCase` - Create notification
- `MarkNotificationAsReadUseCase` - Mark as read
- `MarkAllNotificationsAsReadUseCase` - Mark all as read
- `DeleteNotificationUseCase` - Delete notification
- `GetNotificationsUseCase` - Get user notifications
- `GetUnreadNotificationCountUseCase` - Get unread count
- `UpdateNotificationPreferencesUseCase` - Update preferences
- `SubscribeToPushNotificationsUseCase` - Subscribe to push
- `UnsubscribeFromPushNotificationsUseCase` - Unsubscribe

**DTOs:**

- `CreateNotificationDto`
- `NotificationFilterDto`
- `UpdateNotificationPreferencesDto`
- `PushSubscriptionDto`

### Infrastructure Layer

**Services:**

- `NotificationService` - Core notification service (refactor existing)
- `PushNotificationService` - Web Push API service
- `NotificationRepository` - Database repository

**Configuration:**

- `notification.config.ts` - VAPID keys, settings

### Presentation Layer

**Components:**

- `NotificationCenter` - Main notification dropdown/panel
- `NotificationItem` - Single notification item
- `NotificationBadge` - Unread count badge
- `NotificationPreferences` - Settings component

**Hooks:**

- `useNotifications` - Fetch notifications
- `useNotificationCount` - Real-time unread count
- `usePushNotifications` - Push subscription management

**API Routes:**

- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification (admin/internal)
- `PATCH /api/notifications/[id]/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/[id]` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/preferences` - Get preferences
- `PATCH /api/notifications/preferences` - Update preferences
- `POST /api/notifications/push/subscribe` - Subscribe to push
- `DELETE /api/notifications/push/unsubscribe` - Unsubscribe

---

## 📝 Detaylı Görev Listesi

### 1. Database Migration (1 saat)

- [ ] `notification_priority` enum oluştur
- [ ] `notification_channel` enum oluştur
- [ ] `notifications` tablosu oluştur
- [ ] `notification_preferences` tablosu oluştur
- [ ] `push_subscriptions` tablosu oluştur
- [ ] Indexes oluştur (user_id, is_read, created_at, type)
- [ ] RLS policies oluştur
- [ ] Triggers oluştur (updated_at, auto-cleanup expired)

### 2. Domain Layer (1 saat)

- [ ] `Notification` entity oluştur
- [ ] `NotificationPreferences` entity oluştur
- [ ] `PushSubscription` entity oluştur
- [ ] `NotificationEnums.ts` oluştur (extend existing)
- [ ] `INotificationService` interface oluştur
- [ ] `IPushNotificationService` interface oluştur
- [ ] `INotificationRepository` interface oluştur

### 3. Application Layer (1.5 saat)

- [ ] DTOs oluştur
- [ ] Use cases oluştur (8 use case)
- [ ] Use case testleri yaz

### 4. Infrastructure Layer (2 saat)

- [ ] `NotificationRepository` implementasyonu
- [ ] `NotificationService` refactor (Email Service entegrasyonu)
- [ ] `PushNotificationService` implementasyonu
- [ ] `notification.config.ts` oluştur (VAPID keys)
- [ ] Repository testleri yaz

### 5. API Routes (1 saat)

- [ ] 9 API route oluştur
- [ ] Authentication & authorization
- [ ] Request validation
- [ ] Error handling
- [ ] API route testleri yaz

### 6. Frontend Components (2 saat)

- [ ] `NotificationCenter` component
- [ ] `NotificationItem` component
- [ ] `NotificationBadge` component
- [ ] `NotificationPreferences` component
- [ ] Real-time subscription (Supabase Realtime)
- [ ] Push notification permission request
- [ ] Service worker (Web Push)

### 7. Integration & Testing (0.5 saat)

- [ ] Email Service entegrasyonu test
- [ ] Push notification test
- [ ] Real-time updates test
- [ ] End-to-end test

---

## 🔗 Bağımlılıklar

### Mevcut Sprintler

- ✅ **Sprint 2**: Database & Auth
- ✅ **Sprint 24**: Email System (SendGrid)
- ✅ **Sprint 13**: Forum notifications (referans)

### External Dependencies

- `web-push` - Web Push API library
- `@supabase/supabase-js` - Realtime subscriptions (mevcut)

---

## 🧪 Test Stratejisi

### Unit Tests

- Domain entities
- Use cases
- Services
- Repository

### Integration Tests

- API routes
- Email integration
- Push notification integration
- Real-time updates

### E2E Tests

- Notification flow
- Preferences update
- Push subscription flow

---

## 📊 Başarı Kriterleri

### Functional

- ✅ Kullanıcılar in-app notifications görebiliyor
- ✅ Real-time updates çalışıyor (Supabase Realtime)
- ✅ Email notifications gönderiliyor (Sprint 24 entegrasyonu)
- ✅ Push notifications çalışıyor (Web Push API)
- ✅ Notification preferences kaydediliyor
- ✅ Notification center UI çalışıyor
- ✅ Unread count badge gösteriliyor

### Technical

- ✅ Database migration başarılı
- ✅ RLS policies çalışıyor
- ✅ Real-time subscriptions performanslı
- ✅ Push notifications güvenli (VAPID)
- ✅ Email Service entegrasyonu çalışıyor
- ✅ Test coverage > 80%

---

## 🚀 Sonraki Adımlar

1. Database migration oluştur
2. Domain layer implementasyonu
3. Application layer implementasyonu
4. Infrastructure layer implementasyonu
5. API routes oluştur
6. Frontend components oluştur
7. Integration & testing

---

## 📝 Notlar

- **Web Push API**: Browser native API, VAPID keys gerekli
- **Supabase Realtime**: PostgreSQL changes için real-time subscriptions
- **Email Service**: Sprint 24'teki EmailService kullanılacak
- **Notification Preferences**: User settings ile entegre edilecek
- **Performance**: Expired notifications auto-cleanup (cron job)

---

**Hazırlayan:** AI Assistant  
**Onay:** Bekliyor
