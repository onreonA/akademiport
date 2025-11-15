'use client';

import { useState, useEffect } from 'react';
import { useCompanyRanking, useCompanyBadges } from '@/1-presentation/hooks/useLeaderboard';
import { LeaderboardTable, BadgeGallery, TrendChart } from '@/1-presentation/components/features/leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Loader2 } from 'lucide-react';

export default function CompanyLeaderboardPage() {
  const [companyId, setCompanyId] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success && data.user?.companyId) {
        setCompanyId(data.user.companyId);
        // Fetch company to get programId
        const companyResponse = await fetch(`/api/companies/${data.user.companyId}`);
        const companyData = await companyResponse.json();
        if (companyData.success && companyData.data?.programId) {
          setProgramId(companyData.data.programId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const { data: rankingData, isLoading: rankingLoading } = useCompanyRanking(
    companyId,
    programId
  );
  const { data: badgesData, isLoading: badgesLoading } = useCompanyBadges(companyId);

  const ranking = rankingData?.ranking;
  const badges = badgesData?.badges || [];

  if (rankingLoading || badgesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Liderlik Tablosu</h1>
        <p className="text-muted-foreground mt-2">
          Puanlarınızı ve sıralamanızı görüntüleyin
        </p>
      </div>

      {/* Company Stats */}
      {ranking && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Toplam Puan</CardDescription>
              <CardTitle className="text-3xl">{ranking.totalScore.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sıralama</CardDescription>
              <CardTitle className="text-3xl">
                {ranking.rank === 1 && '🥇'}
                {ranking.rank === 2 && '🥈'}
                {ranking.rank === 3 && '🥉'}
                {ranking.rank > 3 && ranking.rank}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rozetler</CardDescription>
              <CardTitle className="text-3xl">{badges.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Modül Puanları</CardDescription>
              <CardContent className="pt-2">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Proje:</span>
                    <span className="font-medium">{ranking.projectScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eğitim:</span>
                    <span className="font-medium">{ranking.trainingScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Etkinlik:</span>
                    <span className="font-medium">{ranking.eventScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forum:</span>
                    <span className="font-medium">{ranking.forumScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Haberler:</span>
                    <span className="font-medium">{ranking.newsScore}</span>
                  </div>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      )}

      <Tabs defaultValue="rankings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rankings">Genel Sıralama</TabsTrigger>
          <TabsTrigger value="badges">Rozetlerim</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4">
          <LeaderboardTable programId={programId} />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <BadgeGallery companyId={companyId} />
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          {companyId && programId && (
            <Card>
              <CardHeader>
                <CardTitle>Puan Trendi</CardTitle>
                <CardDescription>Son 12 haftalık puan değişimi</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart companyId={companyId} programId={programId} weeks={12} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

