import ProjectDetailClient from './ProjectDetailClient';
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' },
    // undefined durumları için ek path'ler
    { id: 'undefined' },
    { id: 'null' },
    { id: '0' },
    { id: 'default' },
    { id: 'test' },
    { id: 'sample' },
    // Ek güvenlik için
    { id: 'admin' },
    { id: 'dashboard' },
    { id: 'main' },
    { id: 'home' },
  ];
}
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailClient params={{ id }} />;
}
