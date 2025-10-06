import { notFound } from 'next/navigation';

import AdminDocumentDetailClient from './AdminDocumentDetailClient';
interface PageProps {
  params: Promise<{ id: string }>;
}
export default async function AdminDocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }
  return <AdminDocumentDetailClient documentId={id} />;
}
