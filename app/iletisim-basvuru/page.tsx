'use client';
import ModernFooter from '@/components/layout/ModernFooter';

import ContactPage from './ContactPage';
export default function IletisimBasvuru() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Contact Page Content */}
      <ContactPage />
      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
