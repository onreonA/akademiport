# 🤖 Prompt Template Sistemi

## 📋 Genel Geliştirme Prompt'ları

### **🔧 Refactoring Prompt Template**

```
**GÖREV:** [Modül/Component] refactoring

**MEVCUT DURUM:**
- Dosya: [dosya_yolu]
- Sorunlar: [sorun1, sorun2, sorun3]
- Hedef: [hedef_durum]

**YAPILACAKLAR:**
1. [Adım 1]
2. [Adım 2]
3. [Adım 3]

**KURALLAR:**
- Coding standards'a uy
- TypeScript types tanımla
- Error handling ekle
- Test coverage sağla
- Documentation güncelle

**ONAY:** Her adımda onay al, test et, sonra devam et
```

### **🏗️ Yeni Feature Development Prompt**

```
**GÖREV:** [Feature] geliştirme

**GEREKSİNİMLER:**
- [Gereksinim 1]
- [Gereksinim 2]
- [Gereksinim 3]

**TEKNİK TASARIM:**
- Database: [tablo_değişiklikleri]
- API: [endpoint'ler]
- Frontend: [component'ler]
- State: [state_management]

**ADIMLAR:**
1. Database schema güncelle
2. API endpoint'leri oluştur
3. Frontend component'leri geliştir
4. Test'leri yaz
5. Documentation güncelle

**KURALLAR:**
- Incremental development
- Her adımda test
- Code review
- Performance kontrol
```

### **🐛 Bug Fix Prompt Template**

```
**SORUN:** [Bug açıklaması]

**MEVCUT DURUM:**
- Hata: [hata_mesajı]
- Dosya: [dosya_yolu]
- Satır: [satır_numarası]

**BEKLENEN DAVRANIŞ:**
- [Beklenen davranış]

**GERÇEK DAVRANIŞ:**
- [Gerçek davranış]

**ADIMLAR:**
1. Root cause analysis
2. Fix implementation
3. Test verification
4. Regression testing
5. Documentation update

**KURALLAR:**
- Minimal change
- Backward compatibility
- Test coverage
- Performance impact
```

---

## 🎯 Modül-Specific Prompt'lar

### **📊 Proje Yönetimi Modülü**

```
**MODÜL:** Proje Yönetimi

**MEVCUT SORUNLAR:**
- Sürekli bozulan yapı
- Tutarsız state management
- API integration sorunları
- Component hierarchy karmaşası

**HEDEF YAPISI:**
- Clean component hierarchy
- Centralized state management
- Standardized API calls
- Error boundaries
- Loading states
- Type safety

**REFACTORING ADIMLARI:**
1. Mevcut durumu analiz et
2. Target architecture tasarla
3. Component'leri yeniden organize et
4. State management düzenle
5. API integration standardize et
6. Error handling ekle
7. Test'leri yaz
8. Documentation güncelle

**KURALLAR:**
- Her adımda onay al
- Test et, sonra devam et
- Rollback planı hazırla
- Performance kontrol et
```

### **🔐 Authentication Modülü**

```
**MODÜL:** Authentication System

**MEVCUT SORUNLAR:**
- Çifte authentication sistemi
- Role-based access control karmaşası
- Session management sorunları
- Security vulnerabilities

**HEDEF YAPISI:**
- Tek authentication sistemi (Supabase Auth)
- Standardized role-based access
- Secure session management
- JWT token handling
- Refresh token mechanism

**MIGRATION ADIMLARI:**
1. Mevcut sistem analizi
2. Supabase Auth setup
3. Role mapping
4. Session management
5. API integration
6. Frontend integration
7. Testing
8. Documentation

**KURALLAR:**
- Zero downtime
- Data integrity
- Security first
- Rollback planı
```

---

## 📝 Code Review Prompt'ları

### **🔍 Code Review Checklist Prompt**

```
**CODE REVIEW:** [PR/Commit]

**KONTROL LİSTESİ:**
- [ ] Authentication/Authorization
- [ ] Database queries optimized
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] Component reusability
- [ ] Performance considerations
- [ ] Security validations
- [ ] Test coverage
- [ ] Documentation updated
- [ ] Coding standards followed

**ÖZEL KONTROLLER:**
- [ ] API response format
- [ ] Error message consistency
- [ ] Loading states
- [ ] Accessibility
- [ ] Mobile responsiveness

**SONUÇ:**
- [ ] ✅ Approve
- [ ] ❌ Request Changes
- [ ] ⚠️ Conditional Approve
```

---

## 🚀 Deployment Prompt'ları

### **🚀 Production Deployment Prompt**

```
**DEPLOYMENT:** [Feature/Module] to Production

**PRE-DEPLOYMENT CHECKLIST:**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance test passed
- [ ] Database migration ready
- [ ] Environment variables set
- [ ] Monitoring configured
- [ ] Rollback plan ready

**DEPLOYMENT STEPS:**
1. Database migration
2. Code deployment
3. Health check
4. Smoke test
5. Monitoring verification
6. Documentation update

**POST-DEPLOYMENT:**
- [ ] Monitor for 24 hours
- [ ] Performance metrics
- [ ] Error rates
- [ ] User feedback
- [ ] Rollback if needed
```

---

## 📊 Analytics ve Monitoring Prompt'ları

### **📈 Performance Analysis Prompt**

```
**ANALİZ:** Performance Analysis

**METRİKLER:**
- Page load time
- API response time
- Database query time
- Bundle size
- Memory usage
- CPU usage

**TOOLS:**
- Chrome DevTools
- Lighthouse
- WebPageTest
- Database query analyzer
- Bundle analyzer

**OPTIMIZATION:**
- Code splitting
- Lazy loading
- Image optimization
- Caching strategy
- Database indexing
- API optimization

**REPORT:**
- Current metrics
- Target metrics
- Optimization recommendations
- Implementation plan
```

---

## 🎯 Kullanım Talimatları

### **Prompt Kullanımı:**

1. **Template seç** → İhtiyaca uygun template
2. **Parametreleri doldur** → [Brackets] içindeki alanları doldur
3. **Kuralları kontrol et** → Her template'in kurallarını oku
4. **Adım adım ilerle** → Her adımda onay al
5. **Test et** → Her adımda test yap
6. **Documentation güncelle** → Değişiklikleri dokümante et

### **Template Güncelleme:**

- Her yeni modül için template ekle
- Başarılı yaklaşımları template'e ekle
- Başarısız yaklaşımları template'den çıkar
- Sürekli iyileştir

---

**Son Güncelleme:** 2024-09-08
**Template Versiyonu:** 1.0
