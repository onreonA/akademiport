'use client';

import { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Sayfa Bulunamadı</h1>
      <p>Aradığınız sayfa bulunamadı.</p>
      <Link href="/dashboard">Ana Sayfaya Dön</Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
