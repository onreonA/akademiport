'use client';

import { useState, useEffect } from 'react';
import { TopicList } from '@/1-presentation/components/features/forum/TopicList';
import { TopicForm } from '@/1-presentation/components/features/forum/TopicForm';
import { useCreateTopic, useCategories, useTopicsList } from '@/1-presentation/hooks/useForum';
import { CreateTopicDto, UpdateTopicDto } from '@/2-application/dtos/forum';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CompanyForumPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);
  const [isLoadingProgramId, setIsLoadingProgramId] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createTopic = useCreateTopic();
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories(selectedProgramId || '');

  // Fetch company's programId
  useEffect(() => {
    const fetchCompanyProgramId = async () => {
      if (!user?.companyId) {
        setIsLoadingProgramId(false);
        return;
      }

      try {
        setIsLoadingProgramId(true);
        const companyResponse = await fetch(`/api/companies/${user.companyId}`);
        const companyData = await companyResponse.json();

        if (companyData.success && companyData.data?.programId) {
          setSelectedProgramId(companyData.data.programId);
        } else {
          console.error('Program ID not found in company data:', companyData);
          toast.error('Program bilgisi bulunamadı');
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error);
        toast.error('Firma bilgileri yüklenemedi');
      } finally {
        setIsLoadingProgramId(false);
      }
    };

    fetchCompanyProgramId();
  }, [user?.companyId]);

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

  if (isLoadingProgramId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <TopicList
        programId={selectedProgramId}
        basePath="/company-dashboard/forum"
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Konu Oluştur</DialogTitle>
          </DialogHeader>
          {selectedProgramId ? (
            <>
              {isLoadingCategories ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Kategoriler yükleniyor...</p>
                </div>
              ) : categoriesError ? (
                <div className="py-8 text-center text-destructive">
                  <p>Kategoriler yüklenirken bir hata oluştu.</p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    {categoriesError instanceof Error ? categoriesError.message : 'Bilinmeyen hata'}
                  </p>
                </div>
              ) : (
                <TopicForm
                  programId={selectedProgramId}
                  categories={categories}
                  onSubmit={handleCreate}
                  isSubmitting={createTopic.isPending}
                />
              )}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Program bilgisi bulunamadı. Lütfen firmanızın bir programa kayıtlı olduğundan emin
              olun.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
