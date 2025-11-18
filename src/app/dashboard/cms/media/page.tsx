/**
 * Admin CMS Media Management Page
 * Sprint 23: CMS
 */

'use client';

import { useState } from 'react';
import { MediaGallery } from '@/1-presentation/components/features/cms/MediaGallery';
import { MediaUpload } from '@/1-presentation/components/features/cms/MediaUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { CMSMedia } from '@/3-domain/entities/CMSMedia';

export default function AdminCMSMediaPage() {
  const [selectedMedia, setSelectedMedia] = useState<CMSMedia | null>(null);

  const handleMediaSelect = (media: CMSMedia) => {
    setSelectedMedia(media);
    // You can add a modal or sidebar to show media details
    console.log('Selected media:', media);
  };

  const handleUploadComplete = (media: CMSMedia) => {
    // Refresh gallery after upload
    setSelectedMedia(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Medya Yönetimi</h1>
        <p className="text-sm text-muted-foreground">Görselleri ve videoları yönetin</p>
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList>
          <TabsTrigger value="gallery">Galeri</TabsTrigger>
          <TabsTrigger value="upload">Yükle</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          <MediaGallery onSelect={handleMediaSelect} showActions />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <MediaUpload onUploadComplete={handleUploadComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
