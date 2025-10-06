import VideoDetailClient from './VideoDetailClient';
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}
export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VideoDetailClient setId={id} />;
}
