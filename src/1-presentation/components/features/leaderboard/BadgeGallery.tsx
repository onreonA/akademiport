'use client';

import { useBadges, useCompanyBadges } from '@/1-presentation/hooks/useLeaderboard';
import { BadgeCard } from './BadgeCard';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { BadgeCategory, BADGE_CATEGORY_LABELS } from '@/3-domain/enums/LeaderboardEnums';

interface BadgeGalleryProps {
  companyId?: string;
  category?: BadgeCategory;
}

export function BadgeGallery({ companyId, category }: BadgeGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>(
    category || 'all'
  );

  const { data: badgesData, isLoading: badgesLoading } = useBadges(
    selectedCategory !== 'all' ? selectedCategory : undefined,
    true
  );
  const { data: companyBadgesData, isLoading: companyBadgesLoading } = useCompanyBadges(
    companyId || ''
  );

  const badges = badgesData?.badges || [];
  const companyBadges = companyBadgesData?.badges || [];
  const earnedBadgeIds = new Set(companyBadges.map((cb) => cb.badgeId));

  const isLoading = badgesLoading || (companyId ? companyBadgesLoading : false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          Tümü
        </Badge>
        {Object.entries(BADGE_CATEGORY_LABELS).map(([key, label]) => (
          <Badge
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(key as BadgeCategory)}
          >
            {label}
          </Badge>
        ))}
      </div>

      {/* Badges Grid */}
      {badges.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bu kategoride rozet bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            const companyBadge = companyBadges.find((cb) => cb.badgeId === badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earned}
                earnedAt={companyBadge?.earnedAt}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}



