'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable, BadgeGallery } from '@/1-presentation/components/features/leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/atoms/select';

interface Program {
  id: string;
  name: string;
}

export default function AdminLeaderboardPage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs?limit=100');
      const data = await response.json();
      if (data.success && data.data) {
        setPrograms(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Liderlik Tablosu</h1>
        <p className="text-muted-foreground mt-2">
          Firmaların puanlarını ve sıralamalarını görüntüleyin
        </p>
      </div>

      {/* Program Selector */}
      {!loading && programs.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Program:</label>
          <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Tüm programlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm programlar</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs defaultValue="rankings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rankings">Sıralama</TabsTrigger>
          <TabsTrigger value="badges">Rozetler</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4">
          <LeaderboardTable programId={selectedProgramId === 'all' ? undefined : selectedProgramId} />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <BadgeGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}

