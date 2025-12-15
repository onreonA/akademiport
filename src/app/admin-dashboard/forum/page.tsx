'use client';

import { useState } from 'react';
import { TopicList } from '@/1-presentation/components/features/forum/TopicList';
import { TopicForm } from '@/1-presentation/components/features/forum/TopicForm';
import { useCreateTopic, useCategories } from '@/1-presentation/hooks/useForum';
import { CreateTopicDto, UpdateTopicDto } from '@/2-application/dtos/forum';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Label } from '@/presentation/components/ui/atoms/label';
import { usePrograms } from '@/5-shared/hooks/api/usePrograms';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminForumPage() {
  const queryClient = useQueryClient();
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createTopic = useCreateTopic();
  const { data: programsData } = usePrograms({ limit: 100 });
  const programs = programsData?.data || [];
  const { data: categories = [] } = useCategories(selectedProgramId || '');

  const handleCreate = async (dto: CreateTopicDto | UpdateTopicDto) => {
    if (!selectedProgramId) {
      toast.error('Lütfen bir program seçiniz');
      return;
    }
    try {
      // Type guard: ensure it's CreateTopicDto
      if ('programId' in dto || !('id' in dto)) {
        await createTopic.mutateAsync({ ...dto, programId: selectedProgramId } as CreateTopicDto);
        // Toast is already shown in useCreateTopic hook
        setIsCreateDialogOpen(false);
        // Force refetch topics list
        await queryClient.refetchQueries({ queryKey: ['forum', 'topics'] });
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      // Error toast is already shown in useCreateTopic hook
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Program Selection */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Label htmlFor="program-select" className="whitespace-nowrap">
          Program Seçin:
        </Label>
        <Select value={selectedProgramId || ''} onValueChange={setSelectedProgramId}>
          <SelectTrigger id="program-select" className="w-[300px]">
            <SelectValue placeholder="Program seçiniz" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProgramId && (
          <span className="text-sm text-muted-foreground">
            {categories.length} kategori bulundu
          </span>
        )}
      </div>

      <TopicList
        programId={selectedProgramId}
        showActions
        basePath="/admin-dashboard/forum"
        onCreateClick={() => {
          if (!selectedProgramId) {
            toast.error('Lütfen önce bir program seçiniz');
            return;
          }
          setIsCreateDialogOpen(true);
        }}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Konu Oluştur</DialogTitle>
          </DialogHeader>
          {selectedProgramId ? (
            <TopicForm
              programId={selectedProgramId}
              categories={categories}
              onSubmit={handleCreate}
              isSubmitting={createTopic.isPending}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Lütfen önce bir program seçiniz
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
