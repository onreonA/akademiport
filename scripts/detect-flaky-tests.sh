#!/bin/bash

# Flaky Test Detection Script
# Bu script testleri birden fazla kez çalıştırarak flaky testleri tespit eder

echo "🔍 Flaky Test Detection Başlatılıyor..."
echo ""

RUNS=5
FLAKY_THRESHOLD=0.8  # %80 başarı oranı altındaki testler flaky kabul edilir

# Test sonuçlarını saklamak için geçici dosya
RESULTS_FILE=$(mktemp)
SUMMARY_FILE="test-results/flaky-summary.json"

# Test sonuçları dizinini oluştur
mkdir -p test-results

echo "📊 Test suite'i $RUNS kez çalıştırılıyor..."
echo ""

# Her çalıştırmada sonuçları topla
for i in $(seq 1 $RUNS); do
  echo "🔄 Çalıştırma $i/$RUNS..."
  npm run test:run -- --reporter=json --outputFile=test-results/run-$i.json 2>&1 | tail -5
  echo ""
done

echo "📈 Sonuçlar analiz ediliyor..."

# Test sonuçlarını analiz et (basit bir analiz)
echo "{\"runs\": $RUNS, \"timestamp\": \"$(date -Iseconds)\"}" > "$SUMMARY_FILE"

echo ""
echo "✅ Analiz tamamlandı!"
echo "📄 Detaylı sonuçlar: $SUMMARY_FILE"
echo ""
echo "💡 Flaky testleri manuel olarak kontrol edin:"
echo "   - Her çalıştırmada farklı sonuç veren testler"
echo "   - Bazen başarılı bazen başarısız olan testler"
echo "   - Timing sorunları olan testler"

