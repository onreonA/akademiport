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
import { Switch } from '@/presentation/components/ui/atoms/switch';
import { NewsCategory, NEWS_CATEGORY_LABELS } from '@/3-domain/enums/NewsEnums';
import { CreateNewsDto, UpdateNewsDto } from '@/2-application/dtos/news';
import { NewsWithTags } from '@/3-domain/interfaces/repositories/INewsRepository';
import { Loader2 } from 'lucide-react';

const newsFormSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(500, 'Başlık 500 karakterden uzun olamaz'),
  summary: z.string().max(500, 'Özet 500 karakterden uzun olamaz').optional(),
  content: z.string().min(1, 'İçerik gereklidir'),
  category: z.nativeEnum(NewsCategory),
  imageUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  imageAlt: z.string().max(255, 'Alt metin 255 karakterden uzun olamaz').optional(),
  metaDescription: z.string().max(160, 'Meta açıklama 160 karakterden uzun olamaz').optional(),
  metaKeywords: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

interface NewsFormProps {
  programId: string;
  initialData?: NewsWithTags;
  onSubmit: (data: CreateNewsDto | UpdateNewsDto) => Promise<void>;
  isSubmitting?: boolean;
}

export function NewsForm({
  programId,
  initialData,
  onSubmit,
  isSubmitting = false,
}: NewsFormProps) {
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      content: initialData?.content || '',
      category: initialData?.category || NewsCategory.GENERAL,
      imageUrl: initialData?.imageUrl || '',
      imageAlt: initialData?.imageAlt || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: initialData?.metaKeywords?.join(', ') || '',
      isFeatured: initialData?.isFeatured || false,
      isPinned: initialData?.isPinned || false,
    },
  });

  const handleSubmit = async (values: NewsFormValues) => {
    const dto: CreateNewsDto | UpdateNewsDto = {
      ...values,
      programId: initialData ? undefined : programId, // Only for create
      imageUrl: values.imageUrl || undefined,
      imageAlt: values.imageAlt || undefined,
      summary: values.summary || undefined,
      metaDescription: values.metaDescription || undefined,
      metaKeywords: values.metaKeywords
        ? values.metaKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : undefined,
    };

    await onSubmit(dto);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Başlık *</FormLabel>
              <FormControl>
                <Input placeholder="Haber başlığı..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Özet</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Kısa özet (liste görünümünde gösterilir)..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>Liste görünümünde gösterilecek kısa özet</FormDescription>
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
              <FormLabel>İçerik *</FormLabel>
              <FormControl>
                <Textarea placeholder="Haber içeriği (HTML destekli)..." rows={10} {...field} />
              </FormControl>
              <FormDescription>HTML etiketleri kullanabilirsiniz</FormDescription>
              <FormMessage name="content" />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Kategori *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(NEWS_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Görsel URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>Haberin kapak görseli URL&apos;si</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Alt */}
        <FormField
          control={form.control}
          name="imageAlt"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Görsel Alt Metni</FormLabel>
              <FormControl>
                <Input placeholder="Görsel açıklaması..." {...field} />
              </FormControl>
              <FormDescription>SEO için görsel açıklaması</FormDescription>
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
              <FormLabel>Meta Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="SEO için kısa açıklama..." rows={2} {...field} />
              </FormControl>
              <FormDescription>Arama motorları için açıklama (max 160 karakter)</FormDescription>
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
              <FormLabel>Anahtar Kelimeler</FormLabel>
              <FormControl>
                <Input placeholder="e-ticaret, ihracat, seo (virgülle ayırın)" {...field} />
              </FormControl>
              <FormDescription>SEO için anahtar kelimeler (virgülle ayırın)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Featured & Pinned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }: { field: any }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Öne Çıkan</FormLabel>
                  <FormDescription>
                    Bu haber öne çıkan haberler arasında gösterilsin mi?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPinned"
            render={({ field }: { field: any }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sabitlenmiş</FormLabel>
                  <FormDescription>Bu haber en üstte sabitlensin mi?</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
