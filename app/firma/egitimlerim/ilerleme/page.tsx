import { notFound } from 'next/navigation';

import ProgressDashboardClient from './ProgressDashboardClient';
export default async function ProgressDashboardPage() {
  return <ProgressDashboardClient />;
}
