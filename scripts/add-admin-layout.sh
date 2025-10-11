#!/bin/bash

# AdminLayout Ekleme Script'i
# Custom header kullanan admin sayfalarına AdminLayout ekler

FILES=(
  "app/admin/forum-istatistikleri/page.tsx"
  "app/admin/haberler-yonetimi/page.tsx"
  "app/admin/kariyer-portali/page.tsx"
  "app/admin/randevu-talepleri/page.tsx"
  "app/admin/egitim-yonetimi/setler/page.tsx"
  "app/admin/egitim-yonetimi/videolar/page.tsx"
)

TITLES=(
  "Forum İstatistikleri:Forum performans metrikleri ve analitikleri"
  "Haber Yönetimi:Haberler, kategoriler ve uzmanları yönetin"
  "Kariyer Portali:İş başvurularını ve ilanlarını yönetin"
  "Randevu Talepleri:Firma randevu taleplerini yönetin"
  "Eğitim Setleri:Video eğitim setlerini yönetin"
  "Video Yönetimi:Eğitim videolarını yönetin"
)

for i in "${!FILES[@]}"; do
  FILE="${FILES[$i]}"
  IFS=':' read -r TITLE DESC <<< "${TITLES[$i]}"
  
  if [ -f "$FILE" ]; then
    echo "Processing: $FILE"
    echo "  Title: $TITLE"
    echo "  Description: $DESC"
    
    # Check if already has AdminLayout
    if grep -q "import AdminLayout" "$FILE"; then
      echo "  ✅ Already has AdminLayout import"
    else
      echo "  ⚠️  Missing AdminLayout - Manual review needed"
    fi
    echo ""
  fi
done

echo "✅ Analysis complete. Manual updates required for complex pages."
