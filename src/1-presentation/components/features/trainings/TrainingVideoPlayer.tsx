'use client';

/**
 * Training Video Player Component
 *
 * YouTube video player for training videos
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Lock, Play, CheckCircle2, Clock } from 'lucide-react';
import type { TrainingVideo } from '@/domain/entities/TrainingVideo';
import { cn } from '@/presentation/lib/utils';

export interface TrainingVideoPlayerProps {
  video: TrainingVideo;
  isLocked?: boolean;
  progress?: number; // 0-100
  watchedAt?: Date | null;
  onWatchComplete?: (videoId: string, progress: number) => void;
  className?: string;
}

export function TrainingVideoPlayer({
  video,
  isLocked = false,
  progress = 0,
  watchedAt,
  onWatchComplete,
  className,
}: TrainingVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  const getEmbedUrl = (youtubeUrl: string): string => {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : video.youtubeId || '';

    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'Süre bilinmiyor';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 line-clamp-2">{video.title}</CardTitle>
            {video.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {isLocked && (
              <Badge variant="outline" className="border-yellow-500/20 text-yellow-600">
                <Lock className="h-3 w-3 mr-1" />
                Kilitli
              </Badge>
            )}
            {watchedAt && currentProgress >= 100 && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Tamamlandı
              </Badge>
            )}
            {video.durationSeconds && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(video.durationSeconds)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLocked ? (
          <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center space-y-2">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Bu video kilitli</p>
              <p className="text-xs text-muted-foreground">
                Önceki videoları tamamlamanız gerekiyor
              </p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <iframe
              src={getEmbedUrl(video.youtubeUrl)}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsPlaying(true)}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Button size="lg" variant="secondary">
                  <Play className="h-5 w-5 mr-2" />
                  Videoyu Oynat
                </Button>
              </div>
            )}
          </div>
        )}

        {currentProgress > 0 && currentProgress < 100 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">İzleme İlerlemesi</span>
              <span className="font-medium">{Math.round(currentProgress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        )}

        {video.orderIndex !== undefined && (
          <div className="text-xs text-muted-foreground">Sıra: {video.orderIndex + 1}</div>
        )}
      </CardContent>
    </Card>
  );
}
