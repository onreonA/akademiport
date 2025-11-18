# Sprint 25: Chatbot - Dokümantasyon

**Tarih:** 17 Kasım 2025  
**Durum:** ✅ Tamamlandı  
**Sprint Süresi:** 1 hafta

---

## 📋 Genel Bakış

Sprint 25'te AI chatbot sistemi geliştirildi. Chatbot, tüm panellerde (admin, consultant, company) kullanılabilir ve kullanıcılara platform hakkında yardımcı olur.

---

## 🎯 Hedefler

- ✅ AI chatbot tüm panellerde erişilebilir
- ✅ Streaming responses desteği
- ✅ Context management (konuşma geçmişi)
- ✅ Intent detection (basit keyword-based)
- ✅ Eğitim içeriği arama
- ✅ Tüm panellere entegrasyon

---

## 📦 Tamamlanan Özellikler

### Backend

#### 1. Database Migration

- **047_create_chatbot_tables.sql**: Chatbot konuşmaları ve mesajları için tablolar
  - `chatbot_conversations` tablosu
  - `chatbot_messages` tablosu
  - RLS policies
  - Triggers (auto-title generation, stats update)

- **048_add_chatbot_prompt.sql**: Chatbot için default prompt template

#### 2. Domain Layer

- **Entities**: `Chatbot.ts`
  - `ChatbotConversation` entity
  - `ChatbotMessage` entity
  - `ChatbotConversationEntity` (business logic)
  - `ChatbotMessageEntity` (business logic)

- **Interfaces**: `IChatbotRepository.ts`
  - Conversation CRUD operations
  - Message CRUD operations
  - Conversation with messages query

#### 3. Infrastructure Layer

- **SupabaseChatbotRepository**: Supabase implementasyonu
  - Tüm repository metodları implement edildi
  - RLS policies ile güvenlik

#### 4. Application Layer

- **ChatbotConversationUseCase**:
  - Mesaj gönderme ve AI yanıtı alma
  - Konuşma oluşturma/yönetme
  - Context management
  - Intent detection (keyword-based)
  - Konuşma geçmişi yönetimi

- **SearchTrainingContentUseCase**:
  - Eğitim içeriğinde arama
  - Relevance scoring
  - Keyword matching

#### 5. API Routes

- **POST /api/chatbot/chat**:
  - Streaming ve non-streaming mesaj gönderme
  - Server-Sent Events (SSE) desteği
  - Context ve conversation yönetimi

- **GET /api/chatbot/conversations**:
  - Kullanıcının konuşmalarını listeleme
  - Pagination desteği

- **POST /api/chatbot/conversations**:
  - Yeni konuşma oluşturma

- **GET /api/chatbot/conversations/[id]**:
  - Konuşma detayı ve mesajları

- **PUT /api/chatbot/conversations/[id]**:
  - Konuşma güncelleme

- **DELETE /api/chatbot/conversations/[id]**:
  - Konuşma silme

### Frontend

#### 1. Components

- **Chatbot**: Ana chatbot component
- **ChatWindow**: Chat window (modal/dialog)
- **ChatButton**: Floating chat button
- **MessageList**: Mesaj listesi component'i
- **MessageInput**: Mesaj input alanı
- **Markdown**: Basit markdown renderer

#### 2. Hooks

- **useChatbot**: React Query hooks
  - `useChatbotConversations`: Konuşmaları listeleme
  - `useChatbotConversation`: Tek konuşma detayı
  - `useSendChatbotMessage`: Mesaj gönderme (non-streaming)
  - `useSendChatbotMessageStream`: Mesaj gönderme (streaming)
  - `useCreateChatbotConversation`: Yeni konuşma oluşturma
  - `useDeleteChatbotConversation`: Konuşma silme

#### 3. Entegrasyon

- **DashboardLayout**: Tüm panellere chatbot eklendi
  - Admin dashboard
  - Consultant dashboard
  - Company dashboard

---

## 🔧 Teknik Detaylar

### Streaming Implementation

- Server-Sent Events (SSE) kullanıldı
- Her chunk geldiğinde frontend'e gönderiliyor
- Real-time mesaj gösterimi

### Context Management

- Konuşma geçmişi (son 20 mesaj)
- Kullanıcı bilgileri (userId, companyId, programId)
- Eğitim bilgileri (program'a ait eğitimler)

### Intent Detection

Basit keyword-based intent detection:

- `training`: Eğitim soruları
- `project`: Proje/görev soruları
- `ecommerce`: E-ticaret soruları
- `forum`: Forum soruları
- `news`: Haber soruları
- `appointment`: Randevu soruları
- `event`: Etkinlik soruları
- `general`: Genel sorular

### Eğitim Arama

- Keyword matching
- Relevance scoring
- Name ve description'da arama
- Program bazlı filtreleme

---

## 📊 Test Coverage

### Use Case Tests

- ✅ `ChatbotConversationUseCase.test.ts` (5 tests)
- ✅ `SearchTrainingContentUseCase.test.ts` (6 tests)

### API Route Tests

- ✅ `chat/route.test.ts` (5 tests)
- ✅ `conversations/route.test.ts` (5 tests)

**Toplam:** 21 test ✅

---

## 🚀 Kullanım

### Backend

```typescript
// Use case kullanımı
const useCase = new ChatbotConversationUseCase(
  chatbotRepository,
  trainingRepository,
  aiRouter,
  promptManager,
  tokenTracker
);

const result = await useCase.sendMessage({
  message: 'Eğitimler hakkında bilgi ver',
  userId: 'user-1',
  companyId: 'company-1',
  programId: 'program-1',
});
```

### Frontend

```tsx
import { Chatbot } from '@/1-presentation/components/features/chatbot';

// Layout'a ekle
<Chatbot companyId={user.companyId} programId={programId} />;
```

---

## 📝 Notlar

### Gelecek İyileştirmeler

1. **Semantic Search**: Eğitim araması için semantic search eklenebilir
2. **Advanced Intent Detection**: AI-based intent detection
3. **Analytics**: Chatbot kullanım istatistikleri
4. **Quick Actions**: Hızlı işlemler (eğitim açma, proje oluşturma vb.)
5. **Multi-language Support**: Çoklu dil desteği

### Bilinen Sınırlamalar

- Intent detection basit keyword-based (gelecekte AI-based yapılabilir)
- Eğitim araması semantic search değil, keyword matching
- Streaming response'lar için WebSocket alternatifi değerlendirilebilir

---

## ✅ Sprint 25 Tamamlandı

Tüm özellikler implement edildi ve testler başarıyla geçti. Chatbot sistemi production'a hazır! 🎉
