/**
 * Reports Page (Coming Soon)
 *
 * This page will be implemented in Sprint 17
 */

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { EmptyState } from '@/presentation/components/ui/atoms/empty-state';
import { BarChart3, FileText, TrendingUp, PieChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Raporlar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
            Detaylı analiz ve raporlama araçları
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-8 md:p-12">
            <EmptyState
              icon={BarChart3}
              title="Raporlar Yakında Geliyor"
              description="Bu özellik Sprint 17'de eklenecek. Dashboard ve raporlama araçları ile programlarınızı, firmalarınızı ve danışmanlarınızı detaylı analiz edebileceksiniz."
            />
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Program Raporları
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Detaylı program analizleri
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Program performansı, firma katılımı, danışman aktiviteleri ve daha fazlası
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Performans Metrikleri
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Gerçek zamanlı istatistikler
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                KPI'lar, trendler, karşılaştırmalar ve tahminler
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Özel Raporlar
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Kişiselleştirilmiş analizler
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filtrelenebilir, dışa aktarılabilir özel raporlar oluşturun
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Sprint 17'de Gelecek Özellikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Program bazlı detaylı raporlar
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Firma ve kullanıcı aktivite raporları
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Danışman performans metrikleri
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Özelleştirilebilir dashboard widget'ları
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Excel/PDF export özellikleri
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Zamanlı karşılaştırma grafikleri
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
