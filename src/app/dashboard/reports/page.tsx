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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Raporlar
          </h1>
          <p className="text-muted-foreground text-lg">Detaylı analiz ve raporlama araçları</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12">
            <EmptyState
              icon={BarChart3}
              title="Raporlar Yakında Geliyor"
              description="Bu özellik Sprint 17'de eklenecek. Dashboard ve raporlama araçları ile programlarınızı, firmalarınızı ve danışmanlarınızı detaylı analiz edebileceksiniz."
            />
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Program Raporları</CardTitle>
                  <CardDescription>Detaylı program analizleri</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Program performansı, firma katılımı, danışman aktiviteleri ve daha fazlası
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Performans Metrikleri</CardTitle>
                  <CardDescription>Gerçek zamanlı istatistikler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                KPI'lar, trendler, karşılaştırmalar ve tahminler
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <PieChart className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Özel Raporlar</CardTitle>
                  <CardDescription>Kişiselleştirilmiş analizler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Filtrelenebilir, dışa aktarılabilir özel raporlar oluşturun
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Sprint 17'de Gelecek Özellikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Program bazlı detaylı raporlar
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Firma ve kullanıcı aktivite raporları
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Danışman performans metrikleri
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Özelleştirilebilir dashboard widget'ları
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Excel/PDF export özellikleri
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Zamanlı karşılaştırma grafikleri
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
