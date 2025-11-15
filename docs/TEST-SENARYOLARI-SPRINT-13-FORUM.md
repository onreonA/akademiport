# Sprint 13: Forum Modülü Test Senaryoları

## Test Grupları

### GRUP 1: Domain Layer Tests ✅
**Dosya:** `src/3-domain/entities/Forum.test.ts`

**Test Senaryoları:**
- ForumCategory entity validation
- ForumTopic entity validation
- ForumReply entity validation
- ForumLike entity validation
- ForumNotification entity validation
- ForumActivity entity validation

### GRUP 2: Use Case Tests ✅
**Dosya:** `src/2-application/use-cases/forum/*.test.ts`

**Test Senaryoları:**
- CreateTopicUseCase
- UpdateTopicUseCase
- DeleteTopicUseCase
- ReplyTopicUseCase
- UpdateReplyUseCase
- DeleteReplyUseCase
- LikeTopicUseCase
- UnlikeTopicUseCase
- LikeReplyUseCase
- UnlikeReplyUseCase
- MarkSolutionUseCase
- PinTopicUseCase
- UnpinTopicUseCase
- LockTopicUseCase
- UnlockTopicUseCase
- CloseTopicUseCase
- ApproveTopicUseCase
- ListTopicsUseCase

### GRUP 3: Repository Integration Tests ⚠️
**Dosya:** `src/4-infrastructure/database/repositories/SupabaseForumRepository.test.ts`

**Not:** Supabase bağlantısı gerektirir

**Test Senaryoları:**
- Category CRUD operations
- Topic CRUD operations
- Reply CRUD operations
- Like operations
- Filtering and pagination
- Search functionality

### GRUP 4: API Route Tests ✅
**Dosyalar:** `src/app/api/forum/**/*.test.ts`

**Test Senaryoları:**
- GET /api/forum/topics - List topics
- POST /api/forum/topics - Create topic
- GET /api/forum/topics/[id] - Get topic detail
- PUT /api/forum/topics/[id] - Update topic
- DELETE /api/forum/topics/[id] - Delete topic
- POST /api/forum/topics/[id]/pin - Pin topic
- DELETE /api/forum/topics/[id]/pin - Unpin topic
- POST /api/forum/topics/[id]/lock - Lock topic
- DELETE /api/forum/topics/[id]/lock - Unlock topic
- POST /api/forum/topics/[id]/close - Close topic
- POST /api/forum/topics/[id]/approve - Approve topic
- POST /api/forum/topics/[id]/like - Like topic
- DELETE /api/forum/topics/[id]/like - Unlike topic
- GET /api/forum/topics/[id]/replies - List replies
- POST /api/forum/topics/[id]/replies - Create reply
- PUT /api/forum/replies/[id] - Update reply
- DELETE /api/forum/replies/[id] - Delete reply
- POST /api/forum/replies/[id]/like - Like reply
- DELETE /api/forum/replies/[id]/like - Unlike reply
- POST /api/forum/topics/[id]/solution - Mark solution
- GET /api/forum/categories - List categories
- POST /api/forum/categories - Create category

### GRUP 5: Component Tests ✅
**Dosyalar:** `src/1-presentation/components/features/forum/*.test.tsx`

**Test Senaryoları:**
- TopicCard component
- TopicList component
- TopicForm component
- ReplyForm component

### GRUP 6: E2E Tests ✅
**Dosyalar:** `e2e/forum/*.spec.ts`

**Test Senaryoları:**
- Forum topic creation flow
- Forum reply flow
- Forum like/unlike flow
- Forum moderation flow (Admin/Consultant)
- Forum category management (Admin)

## Test Öncelik Sırası

1. ✅ GRUP 1: Domain Layer Tests (Hızlı, bağımlılık yok)
2. ✅ GRUP 2: Use Case Tests (Hızlı, mock repository)
3. ⚠️ GRUP 3: Repository Integration Tests (Supabase gerekli)
4. ✅ GRUP 4: API Route Tests (Mock Supabase)
5. ✅ GRUP 5: Component Tests (React Testing Library)
6. ✅ GRUP 6: E2E Tests (Playwright)

## Test Coverage Hedefleri

- Domain Layer: %100
- Use Cases: %100
- API Routes: %90+
- Components: %85+
- E2E: Kritik flow'lar

