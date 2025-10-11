# 🎨 Sprint 4: Form Components Migration

**Date:** 2025-10-11  
**Goal:** Migrate inline form inputs to reusable Input, Select, Textarea components  
**Estimated Time:** 2-3 hours  
**Expected Savings:** ~300 lines

---

## 📋 Target Files (15 files identified)

### High Priority (Has inline inputs)
1. ✅ `app/admin/egitim-yonetimi/dokumanlar/page.tsx`
2. ⏳ `app/admin/egitim-yonetimi/setler/page.tsx`
3. ⏳ `app/admin/egitim-yonetimi/videolar/page.tsx`
4. ⏳ `app/admin/firma-yonetimi/page.tsx`
5. ⏳ `app/admin/kariyer-portali/page.tsx`

### Medium Priority
6. ⏳ `app/firma/proje-yonetimi/EnhancedProjectList.tsx`
7. ⏳ `app/firma/haberler/page.tsx`
8. ⏳ `app/firma/ik-havuzu/page.tsx`
9. ⏳ `app/firma/raporlar/page.tsx`

### Low Priority (Complex)
10. ⏳ `app/giris/page.tsx`
11. ⏳ `app/firma/forum/[id]/page.tsx`
12. ⏳ `app/firma/proje-yonetimi/[id]/page.tsx`

---

## 🎯 Migration Strategy

### Step 1: Add Imports
```typescript
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
```

### Step 2: Replace Inline Inputs
**Before:**
```tsx
<input
  type="text"
  value={value}
  onChange={handleChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  placeholder="Enter text..."
/>
```

**After:**
```tsx
<Input
  type="text"
  value={value}
  onChange={handleChange}
  placeholder="Enter text..."
/>
```

### Benefits
- ✅ Consistent styling via design tokens
- ✅ Built-in validation states
- ✅ Icon support
- ✅ Character count
- ✅ Loading state
- ✅ Better accessibility

---

## 🚀 Let's Start!

Starting with: `app/admin/egitim-yonetimi/dokumanlar/page.tsx`

