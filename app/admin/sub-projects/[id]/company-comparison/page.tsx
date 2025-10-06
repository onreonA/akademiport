import { Metadata } from 'next';

import AdminLayout from '@/components/admin/AdminLayout';

import CompanyComparisonClient from './CompanyComparisonClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Firma Karşılaştırması - İhracat Akademi',
  description: 'Alt proje firma karşılaştırması ve analizi',
};

export default async function CompanyComparisonPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AdminLayout>
      <CompanyComparisonClient subProjectId={id} />
    </AdminLayout>
  );
}
