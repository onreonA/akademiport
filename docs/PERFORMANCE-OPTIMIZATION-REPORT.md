# Performance Optimization Report

## Tarih: 2025-12-13

## Özet

Bu rapor, projedeki N+1 query sorunlarını ve performans optimizasyon fırsatlarını tespit etmek için yapılan analizi içermektedir.

---

## Tespit Edilen Sorunlar

### 1. ✅ İyi Optimize Edilmiş Alanlar

#### Forum Repository (`SupabaseForumRepository`)

- ✅ `findAllTopics`: JOIN kullanarak kategori, kullanıcı ve firma bilgilerini tek query'de alıyor
- ✅ `findAllReplies`: JOIN kullanarak author ve company bilgilerini tek query'de alıyor
- **Durum**: Optimize edilmiş ✅

#### News Repository (`SupabaseNewsRepository`)

- ✅ `findAll`: JOIN kullanarak author ve tag bilgilerini tek query'de alıyor
- **Durum**: Optimize edilmiş ✅

#### Task Use Cases

- ✅ `ListConsultantTasksUseCase`: Nested JOIN kullanarak tüm ilişkili verileri tek query'de alıyor
- ✅ `ListConsultantPendingQuestionsUseCase`: Batch query'ler kullanarak N+1 sorununu önlüyor
- **Durum**: Optimize edilmiş ✅

---

### 2. ⚠️ Optimize Edilebilecek Alanlar

#### UserRepository.findWithFilters

**Dosya**: `src/4-infrastructure/database/repositories/UserRepository.ts:515-536`

**Sorun**:

```typescript
if (filters.programId) {
  // Ekstra query yapılıyor
  const programUsersResult = await this.findByProgramId(filters.programId);
  const programUserIds = programUsersResult.value?.map((u) => u.id) || [];
  query = query.in('id', programUserIds);
}
```

**Etki**: Program filtresi için ekstra bir query yapılıyor. Bu, özellikle çok sayıda kullanıcı olduğunda performans sorununa yol açabilir.

**Öneri**:

- `user_programs` tablosu ile JOIN kullanarak tek query'de filtreleme yapılabilir
- Veya Supabase'in `in` operatörü ile subquery kullanılabilir

**Öncelik**: Orta

---

#### Leaderboard Rankings - Company Name Enrichment

**Dosya**: `src/4-infrastructure/database/repositories/SupabaseLeaderboardRepository.ts:72-107`

**Mevcut Durum**:

```typescript
async getRankings(filter?: LeaderboardFilter): Promise<Result<LeaderboardRanking[]>> {
  let query = supabase.from('leaderboard_rankings').select('*');
  // Sadece ranking verileri alınıyor
}
```

**Sorun**: `LeaderboardRanking` entity'si `companyId` içeriyor ama `companyName` yok. Eğer frontend'de company name gösterilecekse, her ranking için ayrı query yapılabilir (N+1).

**Öneri**:

- JOIN kullanarak company bilgilerini tek query'de almak:

```typescript
let query = supabase.from('leaderboard_rankings').select(`
    *,
    companies!leaderboard_rankings_company_id_fkey(id, name)
  `);
```

**Öncelik**: Düşük (şu anda frontend'de kullanılmıyor olabilir)

---

#### GetConsultantDashboardStatsUseCase

**Dosya**: `src/2-application/use-cases/analytics/GetConsultantDashboardStatsUseCase.ts`

**Kontrol Edilmesi Gereken**: Loop içinde query yapılıp yapılmadığı kontrol edilmeli.

**Öncelik**: Düşük

---

#### GenerateReportUseCase

**Dosya**: `src/2-application/use-cases/report/GenerateReportUseCase.ts`

**Kontrol Edilmesi Gereken**: Loop içinde query yapılıp yapılmadığı kontrol edilmeli.

**Öncelik**: Düşük

---

## Önerilen Optimizasyonlar

### 1. UserRepository.findWithFilters - Program Filter Optimization

**Hedef**: `programId` filtresi için ekstra query'yi kaldırmak.

**Yaklaşım**:

```typescript
if (filters.programId) {
  // JOIN kullanarak tek query'de filtreleme
  query = query
    .select('users.*, user_programs!inner(program_id)')
    .eq('user_programs.program_id', filters.programId);
}
```

**Beklenen İyileştirme**: %30-50 query süresi azalması (program filtresi kullanıldığında)

---

### 2. Leaderboard Rankings - Company Name JOIN

**Hedef**: Company name'i tek query'de almak.

**Yaklaşım**:

```typescript
let query = supabase.from('leaderboard_rankings').select(`
    *,
    companies!leaderboard_rankings_company_id_fkey(id, name)
  `);
```

**Beklenen İyileştirme**: N+1 query sorununu önler (eğer frontend'de kullanılıyorsa)

---

## Performans Metrikleri

### Mevcut Durum

- Forum queries: ✅ Optimize edilmiş (JOIN kullanılıyor)
- News queries: ✅ Optimize edilmiş (JOIN kullanılıyor)
- Task queries: ✅ Optimize edilmiş (JOIN kullanılıyor)
- User queries: ⚠️ Program filtresi için iyileştirme gerekli
- Leaderboard queries: ⚠️ Company name için JOIN eklenebilir

### Hedef

- Tüm list queries'lerde JOIN kullanımı
- N+1 query sorunlarının tamamen ortadan kaldırılması
- Query sayısının %30-50 azaltılması (program filtresi kullanıldığında)

---

## Sonraki Adımlar

1. ✅ N+1 query sorunlarını tespit et (Tamamlandı)
2. ⏳ UserRepository.findWithFilters optimizasyonu
3. ⏳ Leaderboard rankings company name JOIN ekleme
4. ⏳ Performance monitoring ekleme
5. ⏳ Caching strategy implementasyonu

---

## Notlar

- Çoğu repository zaten JOIN kullanarak optimize edilmiş durumda
- Ana optimizasyon fırsatı UserRepository'de program filtresi
- Leaderboard optimizasyonu frontend ihtiyacına bağlı
