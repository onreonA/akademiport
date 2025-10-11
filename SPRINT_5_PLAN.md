# 🏷️ Sprint 5: Badge Standardization

**Date:** 2025-10-11  
**Goal:** Migrate inline status badges to StatusBadge component  
**Estimated Time:** 1 hour  
**Expected Savings:** ~100-150 lines

---

## 📋 Strategy

### Target Pattern
**Before (Inline):**
```tsx
<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
  Aktif
</span>
```

**After (StatusBadge):**
```tsx
<StatusBadge status="active" />
```

### Benefits
- ✅ 100% consistency
- ✅ Turkish labels built-in
- ✅ 12 status types
- ✅ Pulse animation
- ✅ Design token integration
- ✅ Type-safe

---

## 🎯 Target Files (Priority Order)

### Phase 1: High-Traffic Pages (30 min)
1. ⏳ `app/firma/proje-yonetimi/EnhancedProjectList.tsx` - Project status badges
2. ⏳ `app/admin/proje-yonetimi/[id]/ProjectDetailClient.tsx` - Task/project status
3. ⏳ `app/firma/haberler/page.tsx` - News status
4. ⏳ `app/firma/ik-havuzu/page.tsx` - HR pool status

### Phase 2: Medium Priority (20 min)
5. ⏳ `app/admin/kariyer-portali/page.tsx` - Job application status
6. ⏳ `app/firma/forum/[id]/page.tsx` - Forum post status
7. ⏳ `app/admin/egitim-yonetimi/*` - Education status

### Phase 3: Low Priority (10 min)
8. ⏳ Other pages with status indicators

---

## 🔍 Finding Inline Badges

### Common Patterns to Search:
```bash
# Pattern 1: Status badge classes
bg-(green|red|blue|yellow|orange)-100 text-(green|red|blue|yellow|orange)-800

# Pattern 2: Common status words
Aktif|Pasif|Tamamlandı|Beklemede|İptal|Onaylandı
```

---

## 🚀 StatusBadge Component Usage

### Available Statuses (12)
```typescript
'active'      // Aktif (green)
'inactive'    // Pasif (gray)
'completed'   // Tamamlandı (green)
'pending'     // Beklemede (yellow)
'cancelled'   // İptal Edildi (red)
'approved'    // Onaylandı (green)
'rejected'    // Reddedildi (red)
'in-progress' // Devam Ediyor (blue)
'on-hold'     // Beklemede (orange)
'draft'       // Taslak (gray)
'published'   // Yayınlandı (green)
'archived'    // Arşivlendi (gray)
```

### Features
```tsx
<StatusBadge 
  status="active"     // Required
  pulse={true}        // Optional: animated pulse
  dot={true}          // Optional: dot mode (compact)
  className="..."     // Optional: additional classes
/>
```

---

## 📊 Expected Impact

| Metric | Value |
|--------|-------|
| **Files** | 8-10 |
| **Badges** | ~30-40 |
| **Lines Removed** | ~120 |
| **Lines Added** | ~30 |
| **Net Savings** | ~90 lines |
| **Consistency** | +100% |

---

**Let's Start!** 🚀

