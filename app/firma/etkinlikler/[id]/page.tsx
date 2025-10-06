import EventDetailClient from './EventDetailClient';
export async function generateStaticParams() {
  return [
    { id: 'evt-001' },
    { id: 'evt-002' },
    { id: 'evt-003' },
    { id: 'evt-004' },
    { id: 'evt-005' },
    { id: 'evt-006' },
    { id: 'evt-007' },
    { id: 'evt-008' },
  ];
}
export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <EventDetailClient eventId={params.id} />;
}
