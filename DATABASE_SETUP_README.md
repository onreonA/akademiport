# 🗄️ Veritabanı Kurulum Talimatları

Bu dokümanda eksik veritabanı tablolarını oluşturmak ve enum değerlerini düzeltmek için gerekli adımlar açıklanmıştır.

## 📋 Ön Gereksinimler

- Supabase SQL Editor erişimi
- Veritabanı yönetici yetkileri
- Mevcut proje veritabanı

## 🚀 Kurulum Adımları

### 1. Eksik Tabloları Oluştur

Supabase SQL Editor'da `create-missing-tables.sql` dosyasını çalıştırın:

```sql
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- create-missing-tables.sql
```

**Bu script şunları oluşturur:**

- ✅ `task_completions` tablosu
- ✅ `task_comments` tablosu
- ✅ `task_files` tablosu
- ✅ `task_history` tablosu
- ✅ `consultants` tablosu
- ✅ Gerekli enum'lar
- ✅ Index'ler
- ✅ RLS policies
- ✅ Trigger'lar
- ✅ Tasks tablosuna yeni kolonlar

### 2. Enum Değerlerini Düzelt

Supabase SQL Editor'da `fix-enum-values.sql` dosyasını çalıştırın:

```sql
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- fix-enum-values.sql
```

**Bu script şunları düzeltir:**

- ✅ `task_status` enum'ını genişletir
- ✅ `completion_status` enum'ını oluşturur
- ✅ `user_type_enum` enum'ını oluşturur
- ✅ `priority` enum'ını genişletir
- ✅ `comment_type` enum'ını oluşturur
- ✅ `file_type_category` enum'ını oluşturur
- ✅ `consultant_status` enum'ını oluşturur

### 3. Testleri Çalıştır

Terminal'de şu komutu çalıştırın:

```bash
# Environment variables'ları ayarla
export NEXT_PUBLIC_SUPABASE_URL=https://frylotuwbjhqybcxvvzs.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Test script'ini çalıştır
node test-database-after-fix.js
```

## 📊 Beklenen Sonuçlar

### ✅ Başarılı Kurulum Sonrası

```
📊 Database Test Results After Fix Summary:
✅ Passed: 25
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 Tüm veritabanı testleri başarılı! Sistem hazır!
```

### 🔧 Oluşturulan Tablolar

| Tablo Adı          | Açıklama                  |
| ------------------ | ------------------------- |
| `task_completions` | Görev tamamlama kayıtları |
| `task_comments`    | Görev yorumları           |
| `task_files`       | Görev dosyaları           |
| `task_history`     | Görev geçmişi             |
| `consultants`      | Danışman bilgileri        |

### 📝 Güncellenen Enum'lar

| Enum Adı             | Değerler                                                     |
| -------------------- | ------------------------------------------------------------ |
| `task_status`        | pending, in_progress, pending_approval, completed, cancelled |
| `completion_status`  | pending_approval, approved, rejected                         |
| `user_type_enum`     | company_user, admin_user, consultant                         |
| `priority`           | low, medium, high, urgent, critical                          |
| `comment_type`       | general, question, issue, update, approval, rejection        |
| `file_type_category` | attachment, document, image, video, deliverable              |

## 🔒 Güvenlik

- Tüm tablolar Row Level Security (RLS) ile korunmuştur
- Sadece yetkili kullanıcılar verilerine erişebilir
- Cross-role erişim engellenmiştir

## 🚨 Sorun Giderme

### Hata: "relation does not exist"

```sql
-- Tabloyu kontrol et
SELECT * FROM information_schema.tables WHERE table_name = 'task_completions';
```

### Hata: "type does not exist"

```sql
-- Enum'u kontrol et
SELECT * FROM pg_type WHERE typname = 'completion_status';
```

### Hata: "permission denied"

- Supabase'de service role key kullandığınızdan emin olun
- RLS policies'lerin doğru ayarlandığını kontrol edin

## 📞 Destek

Sorun yaşarsanız:

1. SQL script'lerini sırayla çalıştırdığınızdan emin olun
2. Hata mesajlarını kontrol edin
3. Supabase logs'ları inceleyin

## 🎯 Sonraki Adımlar

Veritabanı kurulumu tamamlandıktan sonra:

1. ✅ API endpoint'leri test edin
2. ✅ Frontend sayfalarını test edin
3. ✅ Kullanıcı akışlarını test edin
4. ✅ Güvenlik testlerini çalıştırın

---

**🎉 Kurulum tamamlandığında sistem %100 çalışır durumda olacak!**
