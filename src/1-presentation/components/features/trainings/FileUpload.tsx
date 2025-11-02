'use client';

/**
 * File Upload Component
 *
 * File upload component for training documents with Supabase Storage support
 */

import * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Upload, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';
import { toast } from 'sonner';

export interface FileUploadProps {
  onUploadComplete?: (
    fileUrl: string,
    fileName: string,
    fileSize: number,
    fileType: string
  ) => void;
  onUploadError?: (error: string) => void;
  accept?: string; // e.g., ".pdf,.doc,.docx"
  maxSize?: number; // in bytes (default: 50MB)
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      const error = `Dosya boyutu çok büyük. Maksimum ${formatFileSize(maxSize)} olmalıdır.`;
      toast.error(error);
      onUploadError?.(error);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
    if (!acceptedExtensions.includes(fileExtension)) {
      const error = `Desteklenmeyen dosya tipi. İzin verilen formatlar: ${accept}`;
      toast.error(error);
      onUploadError?.(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'training-documents');

      const response = await fetch('/api/trainings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Dosya yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      setUploadedFile({
        url: data.url,
        name: file.name,
        size: file.size,
        type: file.type,
      });

      toast.success('Dosya başarıyla yüklendi');
      onUploadComplete?.(data.url, file.name, file.size, file.type);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {!uploadedFile ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              disabled || isUploading
                ? 'border-muted bg-muted/50 cursor-not-allowed'
                : 'border-primary/20 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
            )}
            onClick={handleClick}
          >
            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Yükleniyor...</p>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Dosya yüklemek için tıklayın veya sürükleyin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maksimum {formatFileSize(maxSize)} • {accept}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <div className="p-2 bg-primary/10 rounded-md">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
