'use client';

import { useState, useEffect } from 'react';
import { EcommercePerformanceTable } from '@/1-presentation/components/features/ecommerce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';

interface Program {
  id: string;
  name: string;
}

export default function AdminEcommercePage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [minRevenue, setMinRevenue] = useState<string>('');
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
        <h1 className="text-3xl font-bold">E-ticaret Performans Tablosu</h1>
        <p className="text-muted-foreground mt-2">
          Firmaların e-ticaret performanslarını görüntüleyin ve karşılaştırın
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {!loading && programs.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="program">Program:</Label>
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

        <div className="flex items-center gap-2">
          <Label htmlFor="minRevenue">Min. Gelir:</Label>
          <Input
            id="minRevenue"
            type="number"
            placeholder="0"
            value={minRevenue}
            onChange={(e) => setMinRevenue(e.target.value)}
            className="w-[150px]"
          />
        </div>
      </div>

      {/* Performance Table */}
      <EcommercePerformanceTable
        programId={selectedProgramId === 'all' ? undefined : selectedProgramId}
        minRevenue={minRevenue ? parseFloat(minRevenue) : undefined}
      />
    </div>
  );
}
