import SubProjectsClient from './SubProjectsClient';
export async function generateStaticParams() {
  return [{ id: '550e8400-e29b-41d4-a716-446655440001' }];
}
export default async function SubProjectsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubProjectsClient params={{ id }} />;
}
