#!/bin/bash

# Frontend Analiz Script'i
# Layout, Component, UI/UX standardizasyonu analizi

echo "🔍 FRONTEND STANDARDİZASYON ANALİZİ"
echo "=================================="
echo ""

# 1. Layout Kullanımı Analizi
echo "1️⃣ LAYOUT KULLANIM ANALİZİ"
echo "----------------------------"
echo ""

echo "📊 AdminLayout Kullanımı:"
ADMIN_PAGES=$(find app/admin -name "page.tsx" | wc -l)
ADMIN_WITH_LAYOUT=$(grep -r "AdminLayout" app/admin --include="*.tsx" | grep -v "components/admin/AdminLayout" | wc -l)
echo "   Toplam Admin Sayfası: $ADMIN_PAGES"
echo "   AdminLayout Kullanan: $ADMIN_WITH_LAYOUT"
echo ""

echo "📊 FirmaLayout Kullanımı:"
FIRMA_PAGES=$(find app/firma -name "page.tsx" | wc -l)
FIRMA_WITH_LAYOUT=$(grep -r "FirmaLayout" app/firma --include="*.tsx" | grep -v "components/firma/FirmaLayout" | wc -l)
echo "   Toplam Firma Sayfası: $FIRMA_PAGES"
echo "   FirmaLayout Kullanan: $FIRMA_WITH_LAYOUT"
echo ""

# 2. Console.log Analizi
echo "2️⃣ CONSOLE.LOG ANALİZİ"
echo "----------------------"
echo ""

TOTAL_CONSOLE=$(grep -r "console.log" app --include="*.tsx" --include="*.ts" | wc -l)
echo "   Toplam console.log: $TOTAL_CONSOLE"
echo ""

# 3. Component Tekrarları
echo "3️⃣ COMPONENT TEKRARLARI"
echo "-----------------------"
echo ""

echo "📊 Benzer İsimli Component'ler:"
find components -name "*.tsx" | sed 's|components/||' | sort | uniq -c | sort -rn | head -10
echo ""

# 4. Unused Import Analizi
echo "4️⃣ UNUSED IMPORT ANALİZİ"
echo "------------------------"
echo ""

echo "   ESLint unused import kontrolü..."
npx eslint app --ext .ts,.tsx --format=compact 2>&1 | grep "is defined but never used" | wc -l
echo ""

# 5. Missing Error Boundaries
echo "5️⃣ ERROR BOUNDARY ANALİZİ"
echo "-------------------------"
echo ""

ERROR_BOUNDARIES=$(grep -r "ErrorBoundary" app --include="*.tsx" | wc -l)
echo "   Error Boundary Kullanımı: $ERROR_BOUNDARIES"
echo ""

# 6. Missing Loading States
echo "6️⃣ LOADING STATE ANALİZİ"
echo "------------------------"
echo ""

LOADING_STATES=$(grep -r "isLoading\|loading" app --include="*.tsx" | wc -l)
echo "   Loading State Kullanımı: $LOADING_STATES"
echo ""

# 7. Tailwind Class Analizi
echo "7️⃣ TAILWIND CLASS TUTARLILIĞI"
echo "-----------------------------"
echo ""

echo "📊 Spacing Varyasyonları:"
echo "   p-4 kullanımı: $(grep -r 'p-4' app --include="*.tsx" | wc -l)"
echo "   p-6 kullanımı: $(grep -r 'p-6' app --include="*.tsx" | wc -l)"
echo "   p-8 kullanımı: $(grep -r 'p-8' app --include="*.tsx" | wc -l)"
echo ""

echo "📊 Gradient Kullanımı:"
echo "   gradient-to-r: $(grep -r 'gradient-to-r' app --include="*.tsx" | wc -l)"
echo "   gradient-to-br: $(grep -r 'gradient-to-br' app --include="*.tsx" | wc -l)"
echo ""

# 8. Inline Style Kullanımı
echo "8️⃣ INLINE STYLE KONTROLÜ"
echo "------------------------"
echo ""

INLINE_STYLES=$(grep -r 'style={{' app --include="*.tsx" | wc -l)
echo "   Inline Style Kullanımı: $INLINE_STYLES (Hedef: 0)"
echo ""

# 9. Type Safety
echo "9️⃣ TYPE SAFETY ANALİZİ"
echo "----------------------"
echo ""

ANY_TYPE=$(grep -r ': any' app --include="*.tsx" --include="*.ts" | wc -l)
echo "   'any' Type Kullanımı: $ANY_TYPE (Hedef: Minimum)"
echo ""

echo ""
echo "✅ Analiz tamamlandı!"
echo "📄 Detaylı rapor için frontend-analysis-details.txt dosyasını kontrol edin."
