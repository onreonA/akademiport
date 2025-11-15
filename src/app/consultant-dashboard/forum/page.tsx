'use client';

import { useState } from 'react';
import { TopicList } from '@/1-presentation/components/features/forum/TopicList';
import { TopicForm } from '@/1-presentation/components/features/forum/TopicForm';
import { useCreateTopic, useCategories } from '@/1-presentation/hooks/useForum';
import { CreateTopicDto, UpdateTopicDto } from '@/2-application/dtos/forum';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { useRouter } from 'next/navigation';
import { useConsultantProgram } from '@/5-shared/contexts/ConsultantProgramContext';

export default function ConsultantForumPage() {
  const router = useRouter();
  const { selectedProgram } = useConsultantProgram();
  const selectedProgramId = selectedProgram?.id;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createTopic = useCreateTopic();
  const { data: categories = [] } = useCategories(selectedProgramId || '');

  const handleCreate = async (dto: CreateTopicDto | UpdateTopicDto) => {
    if (!selectedProgramId) {
      alert('Lütfen bir program seçiniz');
      return;
    }
    // Type guard: ensure it's CreateTopicDto
    if ('programId' in dto || !('id' in dto)) {
      await createTopic.mutateAsync({ ...dto, programId: selectedProgramId } as CreateTopicDto);
    }
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <TopicList
        programId={selectedProgramId}
        showActions
        basePath="/consultant-dashboard/forum"
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Konu Oluştur</DialogTitle>
          </DialogHeader>
          {selectedProgramId && (
            <TopicForm
              programId={selectedProgramId}
              categories={categories}
              onSubmit={handleCreate}
              isSubmitting={createTopic.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
