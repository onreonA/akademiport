'use client';

import { useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useCategories, useCreateCategory } from '@/1-presentation/hooks/useForum';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Plus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Kategori adı gereklidir').max(100, 'Kategori adı 100 karakterden uzun olamaz'),
  description: z.string().max(500, 'Açıklama 500 karakterden uzun olamaz').optional(),
  icon: z.string().max(50, 'İkon 50 karakterden uzun olamaz').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu giriniz (örn: #FF5733)').optional(),
  orderIndex: z.number().int().min(0).optional(),
  requireApproval: z.boolean().default(false).optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

function AdminCategoriesPageContent() {
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId') || '';
  const { data: categories = [], isLoading } = useCategories(programId);
  const createCategory = useCreateCategory();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      orderIndex: 0,
      requireApproval: false,
    },
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    if (!programId) {
      alert('Lütfen bir program seçiniz');
      return;
    }

    await createCategory.mutateAsync({
      programId,
      ...values,
    });

    form.reset();
    setIsCreateDialogOpen(false);
  };

  if (!programId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lütfen bir program seçiniz</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Forum Kategorileri</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} kategori bulundu
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz kategori bulunmuyor.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              İlk Kategoriyi Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <CardTitle>{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                )}
                <div className="flex items-center gap-2">
                  {category.color && (
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {category.topicCount || 0} konu
                  </span>
                </div>
                {category.requireApproval && (
                  <Badge className="mt-2 bg-orange-500">Onay Gerekli</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Kategori Oluştur</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Kategori Adı *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Örn: Genel Sorular"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Kategori açıklaması..."
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">İkon (Emoji)</Label>
                <Input
                  id="icon"
                  {...form.register('icon')}
                  placeholder="💬"
                  maxLength={50}
                />
                {form.formState.errors.icon && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.icon.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="color">Renk</Label>
                <Input
                  id="color"
                  type="color"
                  {...form.register('color')}
                />
                {form.formState.errors.color && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.color.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="orderIndex">Sıra</Label>
              <Input
                id="orderIndex"
                type="number"
                {...form.register('orderIndex', { valueAsNumber: true })}
                min={0}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requireApproval"
                {...form.register('requireApproval')}
                className="rounded"
              />
              <Label htmlFor="requireApproval" className="cursor-pointer">
                Onay gerektir
              </Label>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Oluştur
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <AdminCategoriesPageContent />
    </Suspense>
  );
}

