'use client';

import { useLeaderboard } from '@/1-presentation/hooks/useLeaderboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/1-presentation/components/ui/atoms/table';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/1-presentation/components/ui/atoms/avatar';
import { Minus, Loader2 } from 'lucide-react';
import { LeaderboardFilterDto } from '@/2-application/dtos/leaderboard';

interface LeaderboardTableProps {
  programId?: string;
  companyId?: string;
  limit?: number;
}

export function LeaderboardTable({ programId, companyId, limit }: LeaderboardTableProps) {
  const filter: LeaderboardFilterDto = {
    programId,
    companyId,
    limit,
  };

  const { data, isLoading, error } = useLeaderboard(filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Liderlik tablosu yüklenemedi</p>
      </div>
    );
  }

  const rankings = data?.rankings || [];

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Henüz puan kaydı yok</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Sıra</TableHead>
          <TableHead>Firma</TableHead>
          <TableHead className="text-right">Toplam Puan</TableHead>
          <TableHead className="text-right">Proje</TableHead>
          <TableHead className="text-right">Eğitim</TableHead>
          <TableHead className="text-right">Etkinlik</TableHead>
          <TableHead className="text-right">Forum</TableHead>
          <TableHead className="text-right">Haberler</TableHead>
          <TableHead className="text-center">Rozetler</TableHead>
          <TableHead className="text-center">Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankings.map((company) => (
          <TableRow key={company.companyId}>
            <TableCell>
              <div className="flex items-center gap-2">
                {company.rank === 1 && <span className="text-2xl">🥇</span>}
                {company.rank === 2 && <span className="text-2xl">🥈</span>}
                {company.rank === 3 && <span className="text-2xl">🥉</span>}
                {company.rank > 3 && (
                  <span className="font-bold text-muted-foreground">{company.rank}</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={company.companyName} />
                  <AvatarFallback>
                    {company.companyName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{company.companyName}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-lg font-bold">{company.totalScore.toLocaleString()}</span>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {company.projectScore.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {company.trainingScore.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {company.eventScore.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {company.forumScore.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {company.newsScore.toLocaleString()}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary">{company.badgeCount} rozet</Badge>
            </TableCell>
            <TableCell className="text-center">
              {/* Trend will be calculated from history */}
              <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
