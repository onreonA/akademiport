'use client';
import { useParams } from 'next/navigation';

import FirmaLayout from '@/components/firma/FirmaLayout';

export default function ProjectDetailPage() {
  const { id: projectId } = useParams();

  return (
    <FirmaLayout
      title='Proje Detayı'
      description='Proje detaylarını görüntüleyin'
    >
      <div>
        <h1>Test Page</h1>
        <p>Project ID: {projectId}</p>
      </div>
    </FirmaLayout>
  );
}
