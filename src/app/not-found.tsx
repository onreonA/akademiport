'use client';

import { Suspense } from 'react';

function NotFoundContent() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Sayfa Bulunamadı</h1>
      <p>Aradığınız sayfa bulunamadı.</p>
      <a href="/dashboard">Ana Sayfaya Dön</a>
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
