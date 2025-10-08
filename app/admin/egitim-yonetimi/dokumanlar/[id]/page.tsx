import { notFound } from 'next/navigation';

import AdminLayout from '@/components/admin/AdminLayout';

import AdminDocumentDetailClient from './AdminDocumentDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDocumentDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <AdminLayout title='Döküman Detayı'>
      <AdminDocumentDetailClient documentId={id} />
    </AdminLayout>
  );
}
