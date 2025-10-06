import SubProjectDetailClient from './SubProjectDetailClient';
export default async function SubProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; subProjectId: string }>;
}) {
  const { id, subProjectId } = await params;
  return <SubProjectDetailClient params={{ id, subProjectId }} />;
}
