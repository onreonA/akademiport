#!/bin/bash

# Page Check Script Test Helper
# Bu script sunucunun çalışıp çalışmadığını kontrol eder ve script'i çalıştırır

echo "🔍 Page Check Script Test"
echo ""

# Check if server is running
echo "1️⃣ Sunucu kontrolü yapılıyor..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Sunucu çalışıyor"
    SERVER_RUNNING=true
else
    echo "   ⚠️  Sunucu çalışmıyor"
    echo ""
    echo "   💡 Sunucuyu başlatmak için:"
    echo "      npm run dev"
    echo ""
    read -p "   Sunucuyu başlattınız mı? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   ⏳ 15 saniye bekleniyor..."
        sleep 15
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "   ✅ Sunucu hazır!"
            SERVER_RUNNING=true
        else
            echo "   ❌ Sunucu hala hazır değil"
            SERVER_RUNNING=false
        fi
    else
        SERVER_RUNNING=false
    fi
fi

if [ "$SERVER_RUNNING" = true ]; then
    echo ""
    echo "2️⃣ Page check script'i çalıştırılıyor..."
    echo ""
    npm run check:pages
else
    echo ""
    echo "❌ Sunucu çalışmadığı için script çalıştırılamadı"
    echo ""
    echo "📋 Yapılacaklar:"
    echo "   1. Başka bir terminalde: npm run dev"
    echo "   2. Sunucu hazır olduğunda: npm run check:pages"
fi

