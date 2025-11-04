'use client';

/**
 * Training Document Viewer Component
 *
 * Document viewer for training documents (PDF, Word, Excel, etc.)
 */

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Lock, FileText, Download, CheckCircle2, Eye } from 'lucide-react';
import type { TrainingDocument } from '@/domain/entities/TrainingDocument';
import { cn } from '@/presentation/lib/utils';
import { DocumentViewerService } from '@/infrastructure/external/document-viewer.service';

export interface TrainingDocumentViewerProps {
  document: TrainingDocument;
  isLocked?: boolean;
  progress?: number; // 0-100
  readAt?: Date | null;
  onReadComplete?: (documentId: string, progress: number) => void;
  className?: string;
}

export function TrainingDocumentViewer({
  document,
  isLocked = false,
  progress = 0,
  readAt,
  onReadComplete,
  className,
}: TrainingDocumentViewerProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Boyut bilinmiyor';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  // Get viewer configuration using DocumentViewerService
  const viewerConfig = useMemo(() => {
    return DocumentViewerService.getViewer({
      fileUrl: document.fileUrl,
      fileType: document.fileType,
      fileName: document.fileName,
      fileSize: document.fileSize,
    });
  }, [document.fileUrl, document.fileType, document.fileName, document.fileSize]);

  const fileTypeLabel = DocumentViewerService.getFileTypeLabel(
    document.fileType,
    document.fileName
  );

  const handleDownload = () => {
    window.open(document.fileUrl, '_blank');
  };

  const handleView = () => {
    if (isLocked) return;
    window.open(document.fileUrl, '_blank');
    // Simulate reading progress
    setTimeout(() => {
      const newProgress = Math.min(100, currentProgress + 10);
      setCurrentProgress(newProgress);
      if (newProgress >= 100 && onReadComplete && !readAt) {
        onReadComplete(document.id, newProgress);
      }
    }, 2000);
  };

  const handleMarkAsRead = () => {
    if (onReadComplete && !readAt) {
      onReadComplete(document.id, 100);
      setCurrentProgress(100);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 line-clamp-2">{document.title}</CardTitle>
            {document.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{document.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {isLocked && (
              <Badge variant="outline" className="border-yellow-500/20 text-yellow-600">
                <Lock className="h-3 w-3 mr-1" />
                Kilitli
              </Badge>
            )}
            {readAt && currentProgress >= 100 && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Okundu
              </Badge>
            )}
            <Badge variant="outline">{fileTypeLabel}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>{document.fileName}</span>
          </div>
          {document.fileSize && <span>{formatFileSize(document.fileSize)}</span>}
        </div>

        {isLocked ? (
          <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center space-y-2">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Bu döküman kilitli</p>
              <p className="text-xs text-muted-foreground">Önceki dökümanları okumanız gerekiyor</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {viewerConfig.canPreview && viewerConfig.viewerUrl ? (
              <div className="aspect-video bg-secondary rounded-lg overflow-hidden border">
                <iframe
                  src={viewerConfig.viewerUrl}
                  title={document.title}
                  className="w-full h-full"
                  allow="fullscreen"
                />
              </div>
            ) : (
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {viewerConfig.message || 'Önizleme mevcut değil'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bu dosya tipi için önizleme desteklenmiyor. Lütfen indirerek görüntüleyin.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleView}
                className="flex-1"
                disabled={isLocked}
              >
                <Eye className="h-4 w-4 mr-2" />
                Görüntüle
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLocked}>
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
              {!readAt && currentProgress < 100 && (
                <Button variant="outline" size="sm" onClick={handleMarkAsRead} disabled={isLocked}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Okundu İşaretle
                </Button>
              )}
            </div>
          </div>
        )}

        {currentProgress > 0 && currentProgress < 100 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Okuma İlerlemesi</span>
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

        {document.orderIndex !== undefined && (
          <div className="text-xs text-muted-foreground">Sıra: {document.orderIndex + 1}</div>
        )}
      </CardContent>
    </Card>
  );
}
