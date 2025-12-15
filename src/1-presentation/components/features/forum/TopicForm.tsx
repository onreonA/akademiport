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
import { TopicPriority, TOPIC_PRIORITY_LABELS } from '@/3-domain/enums/ForumEnums';
import { CreateTopicDto, UpdateTopicDto } from '@/2-application/dtos/forum';
import { ForumTopicWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';
import { ForumCategory } from '@/3-domain/entities/Forum';
import { Loader2 } from 'lucide-react';

const topicFormSchema = z.object({
  categoryId: z.string().min(1, 'Kategori gereklidir'),
  title: z.string().min(1, 'Başlık gereklidir').max(500, 'Başlık 500 karakterden uzun olamaz'),
  content: z.string().min(1, 'İçerik gereklidir'),
  priority: z.nativeEnum(TopicPriority).default(TopicPriority.NORMAL),
});

type TopicFormValues = z.infer<typeof topicFormSchema>;

interface TopicFormProps {
  programId: string;
  categories: ForumCategory[];
  initialData?: ForumTopicWithDetails;
  onSubmit: (data: CreateTopicDto | UpdateTopicDto) => Promise<void>;
  isSubmitting?: boolean;
}

export function TopicForm({
  programId,
  categories,
  initialData,
  onSubmit,
  isSubmitting = false,
}: TopicFormProps) {
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema) as any,
    defaultValues: {
      categoryId: initialData?.categoryId || '',
      title: initialData?.title || '',
      content: initialData?.content || '',
      priority: initialData?.priority || TopicPriority.NORMAL,
    },
  });

  const handleSubmit = async (values: TopicFormValues) => {
    const dto: CreateTopicDto | UpdateTopicDto = {
      ...values,
      programId: initialData ? undefined : programId, // Only for create
    };

    await onSubmit(dto);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Kategori *</FormLabel>
              {categories.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  Henüz kategori bulunmuyor. Lütfen admin veya danışman ile iletişime geçin.
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value} disabled={!!initialData}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormDescription>Konunun ait olduğu kategori</FormDescription>
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
                <Input placeholder="Konu başlığı..." {...field} />
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
              <FormLabel>İçerik *</FormLabel>
              <FormControl>
                <Textarea placeholder="Konu içeriği..." rows={10} {...field} />
              </FormControl>
              <FormDescription>Konunuzun detaylı açıklaması</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Öncelik</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(TOPIC_PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Konunun öncelik seviyesi</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
