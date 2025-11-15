'use client';

import { Badge as BadgeEntity } from '@/3-domain/entities/Leaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { BADGE_CATEGORY_LABELS } from '@/3-domain/enums/LeaderboardEnums';

interface BadgeCardProps {
  badge: BadgeEntity;
  earned?: boolean;
  earnedAt?: Date;
}

export function BadgeCard({ badge, earned = false, earnedAt }: BadgeCardProps) {
  const categoryLabel = BADGE_CATEGORY_LABELS[badge.category as keyof typeof BADGE_CATEGORY_LABELS] || badge.category;

  return (
    <Card className={`transition-all hover:shadow-lg ${earned ? 'ring-2 ring-primary' : 'opacity-60'}`}>
      <CardHeader className="text-center">
        <div className="text-6xl mb-2">{badge.icon || '🏆'}</div>
        <CardTitle className="text-lg">{badge.name}</CardTitle>
        <CardDescription className="text-sm">{badge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit mx-auto">
            {categoryLabel}
          </Badge>
          {badge.pointsBonus > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              +{badge.pointsBonus} bonus puan
            </div>
          )}
          {earned && earnedAt && (
            <div className="text-center text-xs text-muted-foreground mt-2">
              Kazanıldı: {new Date(earnedAt).toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



