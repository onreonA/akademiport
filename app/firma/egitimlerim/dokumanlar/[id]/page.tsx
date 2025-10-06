import { notFound } from 'next/navigation';

import DocumentDetailClient from './DocumentDetailClient';
interface PageProps {
  params: Promise<{ id: string }>;
}
export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }
  return <DocumentDetailClient documentId={id} />;
}
