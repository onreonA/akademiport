/**
 * CMS Page Form Component
 * Sprint 23: CMS
 */

'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/components/ui/atoms/form';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { CMSPage, CMSPageStatus } from '@/3-domain/entities/CMSPage';
import { RichTextEditor } from './RichTextEditor';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';

const cmsPageFormSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug gereklidir')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  title: z.string().min(1, 'Başlık gereklidir').max(255, 'Başlık 255 karakterden uzun olamaz'),
  content: z.string().default(''),
  status: z.nativeEnum({ draft: 'draft', published: 'published', archived: 'archived' } as any),
  metaTitle: z.string().max(60, 'Meta title maksimum 60 karakter olabilir').optional(),
  metaDescription: z
    .string()
    .max(160, 'Meta description maksimum 160 karakter olabilir')
    .optional(),
  metaKeywords: z.string().optional(),
  ogImageUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  ogTitle: z.string().max(255).optional(),
  ogDescription: z.string().optional(),
  canonicalUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
});

type CMSPageFormValues = z.infer<typeof cmsPageFormSchema>;

interface CMSPageFormProps {
  initialData?: CMSPage;
  onSubmit: (data: CMSPageFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function CMSPageForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onImageUpload,
}: CMSPageFormProps) {
  const form = useForm<CMSPageFormValues>({
    resolver: zodResolver(cmsPageFormSchema) as any,
    defaultValues: {
      slug: initialData?.slug || '',
      title: initialData?.title || '',
      content: initialData?.content ? JSON.stringify(initialData.content) : '',
      status: initialData?.status || 'draft',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: initialData?.metaKeywords?.join(', ') || '',
      ogImageUrl: initialData?.ogImageUrl || '',
      ogTitle: initialData?.ogTitle || '',
      ogDescription: initialData?.ogDescription || '',
      canonicalUrl: initialData?.canonicalUrl || '',
    },
  });

  const handleSubmit = async (values: CMSPageFormValues) => {
    await onSubmit(values);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">İçerik</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="ana-sayfa" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL&apos;de kullanılacak slug (örn: /ana-sayfa). Sadece küçük harf, rakam ve
                    tire kullanılabilir.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Başlık *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sayfa başlığı..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>İçerik</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Sayfa içeriğini yazın..."
                      onImageUpload={onImageUpload}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Durum</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="published">Yayınlandı</SelectItem>
                      <SelectItem value="archived">Arşivlendi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            {/* Meta Title */}
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO başlığı (max 60 karakter)..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Arama motorlarında görünecek başlık (maksimum 60 karakter önerilir)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meta Description */}
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="SEO açıklaması (max 160 karakter)..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Arama motorlarında görünecek açıklama (maksimum 160 karakter önerilir)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meta Keywords */}
            <FormField
              control={form.control}
              name="metaKeywords"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Meta Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="anahtar, kelime, liste" {...field} />
                  </FormControl>
                  <FormDescription>Virgülle ayrılmış anahtar kelimeler</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OG Image URL */}
            <FormField
              control={form.control}
              name="ogImageUrl"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>OG Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Open Graph görsel URL&apos;i (sosyal medya paylaşımları için)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OG Title */}
            <FormField
              control={form.control}
              name="ogTitle"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>OG Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Sosyal medya başlığı..." {...field} />
                  </FormControl>
                  <FormDescription>Sosyal medya paylaşımlarında görünecek başlık</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OG Description */}
            <FormField
              control={form.control}
              name="ogDescription"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>OG Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Sosyal medya açıklaması..." rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Sosyal medya paylaşımlarında görünecek açıklama</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Canonical URL */}
            <FormField
              control={form.control}
              name="canonicalUrl"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Canonical URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    SEO için canonical URL (duplicate content önleme)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initialData ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
