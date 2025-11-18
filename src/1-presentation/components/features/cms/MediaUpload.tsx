/**
 * Media Upload Component
 * Sprint 23: CMS
 */

'use client';

import { useState, useCallback } from 'react';
import { useUploadCMSMedia } from '@/1-presentation/hooks/useCMS';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface MediaUploadProps {
  onUploadComplete?: (media: any) => void;
  maxFileSize?: number; // bytes
  acceptedTypes?: string[];
}

export function MediaUpload({
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'video/*'],
}: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const uploadMedia = useUploadCMSMedia();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        if (selectedFile.size > maxFileSize) {
          toast.error(`Dosya boyutu maksimum ${maxFileSize / 1024 / 1024}MB olabilir`);
          return;
        }
        setFile(selectedFile);
        setAltText(selectedFile.name);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setPreview(null);
        }
      }
    },
    [maxFileSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Lütfen bir dosya seçin');
      return;
    }

    try {
      // Upload file to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/cms/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Dosya yüklenemedi');
      }

      const uploadData = await uploadResponse.json();

      // Create media record
      const result = await uploadMedia.mutateAsync({
        filename: uploadData.data.filename,
        originalFilename: uploadData.data.originalFilename,
        mimeType: uploadData.data.mimeType,
        fileSize: uploadData.data.fileSize,
        fileUrl: uploadData.data.url,
        storagePath: uploadData.data.path,
        altText: altText || undefined,
        caption: caption || undefined,
      });

      toast.success('Medya yüklendi');
      setFile(null);
      setPreview(null);
      setAltText('');
      setCaption('');

      if (onUploadComplete) {
        onUploadComplete(result.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Medya yüklenemedi');
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setAltText('');
    setCaption('');
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!file && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}
            hover:border-primary hover:bg-primary/5
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {isDragActive ? 'Dosyayı buraya bırakın' : 'Dosya seçin veya sürükleyin'}
          </p>
          <p className="text-xs text-muted-foreground">
            Görsel veya video (max {maxFileSize / 1024 / 1024}MB)
          </p>
        </div>
      )}

      {/* Preview & Form */}
      {file && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-4">
              {preview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <ImageIcon className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />
                  <img src={preview} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemove}>
                  <X className="h-4 w-4 mr-2" />
                  Kaldır
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="altText">Alt Text (SEO)</Label>
              <Input
                id="altText"
                placeholder="Görsel açıklaması..."
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Açıklama</Label>
              <Textarea
                id="caption"
                placeholder="Görsel açıklaması..."
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <Button onClick={handleUpload} disabled={uploadMedia.isPending} className="w-full">
              {uploadMedia.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Yükle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
