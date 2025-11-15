'use client';

import { NewsList } from '@/1-presentation/components/features/news';

export default function CompanyNewsPage() {
  return (
    <div className="space-y-6">
      <NewsList
        showActions={false}
        basePath="/company-dashboard/news"
      />
    </div>
  );
}


