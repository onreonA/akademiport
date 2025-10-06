import CompanyDetailClient from './CompanyDetailClient';
export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <CompanyDetailClient params={params} />;
}
