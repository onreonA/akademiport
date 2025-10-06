'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';

import TaskManagementClient from './TaskManagementClient';

interface PageProps {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
}

export default function TaskDetailPage({ params }: PageProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/giris');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <FirmaLayout
      title='Görev Detayı'
      description='Görev detayları ve yönetimi'
      showHeader={false}
    >
      <TaskManagementClient taskId={params.taskId} />
    </FirmaLayout>
  );
}
