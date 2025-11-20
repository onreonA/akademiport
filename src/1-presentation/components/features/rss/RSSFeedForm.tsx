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
import { CreateRSSFeedDto, UpdateRSSFeedDto } from '@/1-presentation/hooks/useRSSFeeds';
import { RSSFeed } from '@/3-domain/entities/RSSFeed';
import { usePrograms } from '@/5-shared/hooks/api/usePrograms';
import { Loader2 } from 'lucide-react';

const rssFeedFormSchema = z.object({
  programId: z.string().min(1, 'Program seçilmelidir'),
  name: z.string().min(1, 'Ad gereklidir').max(255, 'Ad 255 karakterden uzun olamaz'),
  feedUrl: z.string().url('Geçerli bir URL giriniz').min(1, 'Feed URL gereklidir'),
  description: z.string().max(1000, 'Açıklama 1000 karakterden uzun olamaz').optional(),
  category: z.nativeEnum(NewsCategory).optional(),
  isActive: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  checkIntervalMinutes: z.number().min(60, 'En az 60 dakika olmalıdır').default(360),
});

type RSSFeedFormValues = z.infer<typeof rssFeedFormSchema>;

interface RSSFeedFormProps {
  initialData?: RSSFeed;
  onSubmit: (data: CreateRSSFeedDto | UpdateRSSFeedDto) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function RSSFeedForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: RSSFeedFormProps) {
  const { data: programsData } = usePrograms({});
  const programs = programsData?.data || [];

  const form = useForm<RSSFeedFormValues>({
    resolver: zodResolver(rssFeedFormSchema) as any,
    defaultValues: {
      programId: initialData?.programId || '',
      name: initialData?.name || '',
      feedUrl: initialData?.feedUrl || '',
      description: initialData?.description || '',
      category: (initialData?.category as NewsCategory) || NewsCategory.GENERAL,
      isActive: initialData?.isActive ?? true,
      autoPublish: initialData?.autoPublish ?? false,
      checkIntervalMinutes: initialData?.checkIntervalMinutes || 360,
    },
  });

  const handleSubmit = async (values: RSSFeedFormValues) => {
    const dto: CreateRSSFeedDto | UpdateRSSFeedDto = {
      ...(initialData ? {} : { programId: values.programId }),
      name: values.name,
      feedUrl: values.feedUrl,
      description: values.description || undefined,
      category: values.category || undefined,
      isActive: values.isActive,
      autoPublish: values.autoPublish,
      checkIntervalMinutes: values.checkIntervalMinutes,
    };

    await onSubmit(dto);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Program */}
        {!initialData && (
          <FormField
            control={form.control}
            name="programId"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Program *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Program seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Feed Adı *</FormLabel>
              <FormControl>
                <Input placeholder="Örn: E-İhracat Haberleri" {...field} />
              </FormControl>
              <FormDescription>RSS feed&apos;in görünen adı</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Feed URL */}
        <FormField
          control={form.control}
          name="feedUrl"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Feed URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/rss.xml" {...field} />
              </FormControl>
              <FormDescription>RSS feed URL&apos;i</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="Feed hakkında açıklama..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(value as NewsCategory)}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(NEWS_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Oluşturulan haberlerin varsayılan kategorisi</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Check Interval */}
        <FormField
          control={form.control}
          name="checkIntervalMinutes"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Kontrol Aralığı (dakika) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={60}
                  placeholder="360"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 360)}
                />
              </FormControl>
              <FormDescription>
                Feed&apos;in ne sıklıkla kontrol edileceği (en az 60 dakika)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Active */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif</FormLabel>
                <FormDescription>Feed aktifse otomatik kontrol edilir</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Auto Publish */}
        <FormField
          control={form.control}
          name="autoPublish"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Otomatik Yayınlama</FormLabel>
                <FormDescription>
                  Aktifse, yeni item&apos;lar otomatik olarak AI ile yeniden yazılıp haber olarak
                  oluşturulur (draft)
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
