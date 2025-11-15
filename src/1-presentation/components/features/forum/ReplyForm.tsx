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
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { CreateReplyDto, UpdateReplyDto } from '@/2-application/dtos/forum';
import { ForumReplyWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Loader2 } from 'lucide-react';

const replyFormSchema = z.object({
  content: z.string().min(1, 'Yanıt içeriği gereklidir'),
});

type ReplyFormValues = z.infer<typeof replyFormSchema>;

interface ReplyFormProps {
  topicId: string;
  parentId?: string | null;
  initialData?: ForumReplyWithDetails;
  onSubmit: (data: CreateReplyDto | UpdateReplyDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function ReplyForm({
  topicId,
  parentId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ReplyFormProps) {
  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema) as any,
    defaultValues: {
      content: initialData?.content || '',
    },
  });

  const handleSubmit = async (values: ReplyFormValues) => {
    const dto: CreateReplyDto | UpdateReplyDto = {
      ...values,
      topicId: initialData ? undefined : topicId, // Only for create
      parentId: initialData ? undefined : parentId || null, // Only for create
    };

    await onSubmit(dto);
    form.reset();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>
                {initialData ? 'Yanıtı Düzenle' : parentId ? 'Yanıtla' : 'Yanıt Yaz'}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={initialData ? 'Yanıt içeriği...' : 'Yanıtınızı yazın...'}
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {initialData ? 'Yanıtınızı düzenleyebilirsiniz' : 'Konuya yanıt yazabilirsiniz'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Güncelle' : 'Gönder'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
