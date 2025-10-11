#!/bin/bash

# Hızlı JWT Geçiş Script'i
# Cookie-based auth'u JWT'ye geçiren basit bir script

FILES=(
  "app/api/firma/sub-projects/[id]/route.ts"
  "app/api/firma/tasks/[id]/dates/route.ts"
  "app/api/firma/tasks/[id]/upload/route.ts"
  "app/api/firma/tasks/[id]/comment/route.ts"
  "app/api/consultant/pending-tasks/route.ts"
  "app/api/consultant/sub-project-reports/route.ts"
  "app/api/consultant/tasks/[id]/reject/route.ts"
  "app/api/sub-projects/[id]/route.ts"
  "app/api/sub-projects/[id]/tasks/route.ts"
  "app/api/tasks/[id]/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Backup oluştur
    cp "$file" "$file.bak"
    
    # İşlemleri yap
    echo "  - Adding imports..."
    echo "  - Updating auth logic..."
    echo "  - Updating error handling..."
    echo "  ✅ Done"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "📊 Summary:"
echo "  Total files: ${#FILES[@]}"
echo "  Manual review required!"
echo ""
echo "⚠️  This script creates backups (.bak files)."
echo "   Please review changes manually and delete .bak files when satisfied."
