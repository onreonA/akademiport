import VideoPlayerClient from './VideoPlayerClient';
export async function generateStaticParams() {
  return [
    { id: '1', videoId: '1' },
    { id: '2', videoId: '2' },
    { id: '3', videoId: '3' },
  ];
}
export default async function VideoPlayerPage({
  params,
}: {
  params: Promise<{ id: string; videoId: string }>;
}) {
  const { id, videoId } = await params;
  return <VideoPlayerClient setId={id} videoId={videoId} />;
}
