'use client';

import { NewsList } from '@/1-presentation/components/features/news';

export default function ConsultantNewsPage() {
  return (
    <div className="space-y-6">
      <NewsList showActions={false} basePath="/consultant-dashboard/news" />
    </div>
  );
}
