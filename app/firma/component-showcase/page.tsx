'use client';

import { useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import StatsCard from '@/components/ui/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Textarea from '@/components/ui/Textarea';

export default function ComponentShowcasePage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: '',
  });

  return (
    <FirmaLayout
      title='Component Showcase'
      description='UI Component Library Showcase'
    >
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white'>
          <h1 className='text-3xl font-bold mb-2'>UI Component Library</h1>
          <p className='text-blue-100'>
            Modern, reusable components for Akademi Port platform
          </p>
        </div>

        {/* Stats Cards */}
        <section>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Stats Cards</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <StatsCard
              icon='ri-user-line'
              title='Toplam Kullanıcı'
              value='1,234'
              variant='gradient'
              iconColor='primary'
            />
            <StatsCard
              icon='ri-check-line'
              title='Tamamlanan'
              value='856'
              variant='default'
              iconColor='success'
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              icon='ri-time-line'
              title='Devam Eden'
              value='378'
              variant='default'
              iconColor='warning'
            />
            <StatsCard
              icon='ri-trophy-line'
              title='Başarı Oranı'
              value='89%'
              variant='default'
              iconColor='info'
            />
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Buttons</h2>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <Button variant='primary' icon='ri-add-line'>
                Primary
              </Button>
              <Button variant='secondary' icon='ri-edit-line'>
                Secondary
              </Button>
              <Button variant='success' icon='ri-check-line'>
                Success
              </Button>
              <Button variant='warning' icon='ri-alert-line'>
                Warning
              </Button>
              <Button variant='error' icon='ri-close-line'>
                Error
              </Button>
              <Button variant='ghost' icon='ri-eye-line'>
                Ghost
              </Button>
              <Button variant='outline' icon='ri-download-line'>
                Outline
              </Button>
              <Button variant='link' icon='ri-external-link-line'>
                Link
              </Button>
            </div>
          </div>
        </section>

        {/* Form Components */}
        <section>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Form Components
          </h2>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İsim
                </label>
                <Input
                  type='text'
                  placeholder='Adınızı girin'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  icon='ri-user-line'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  E-posta
                </label>
                <Input
                  type='email'
                  placeholder='email@example.com'
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  icon='ri-mail-line'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Rol
                </label>
                <Select
                  value={formData.role}
                  onChange={e =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value=''>Rol seçin</option>
                  <option value='admin'>Admin</option>
                  <option value='firma'>Firma</option>
                  <option value='consultant'>Danışman</option>
                </Select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Mesaj
                </label>
                <Textarea
                  placeholder='Mesajınızı yazın...'
                  value={formData.message}
                  onChange={e =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Badges</h2>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Status Badges
                </h3>
                <div className='flex flex-wrap gap-3'>
                  <StatusBadge status='active'>Aktif</StatusBadge>
                  <StatusBadge status='inactive'>Pasif</StatusBadge>
                  <StatusBadge status='pending'>Beklemede</StatusBadge>
                  <StatusBadge status='completed'>Tamamlandı</StatusBadge>
                  <StatusBadge status='cancelled'>İptal</StatusBadge>
                </div>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Regular Badges
                </h3>
                <div className='flex flex-wrap gap-3'>
                  <Badge variant='primary'>Primary</Badge>
                  <Badge variant='secondary'>Secondary</Badge>
                  <Badge variant='success'>Success</Badge>
                  <Badge variant='warning'>Warning</Badge>
                  <Badge variant='error'>Error</Badge>
                  <Badge variant='info'>Info</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Cards</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card variant='default'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Default Card
              </h3>
              <p className='text-gray-600 mb-4'>
                Bu bir varsayılan kart örneğidir. Temiz ve modern tasarım.
              </p>
              <Button variant='primary' size='sm'>
                Devam Et
              </Button>
            </Card>
            <Card variant='elevated'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Elevated Card
              </h3>
              <p className='text-gray-600 mb-4'>
                Gölgeli kart örneği. Daha belirgin görünüm.
              </p>
              <Button variant='secondary' size='sm'>
                İncele
              </Button>
            </Card>
            <Card variant='outlined'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Outlined Card
              </h3>
              <p className='text-gray-600 mb-4'>
                Çerçeveli kart örneği. Minimal tasarım.
              </p>
              <Button variant='outline' size='sm'>
                Başla
              </Button>
            </Card>
          </div>
        </section>

        {/* Modal */}
        <section>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Modal</h2>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <Button
              variant='primary'
              icon='ri-window-line'
              onClick={() => setShowModal(true)}
            >
              Modal Aç
            </Button>
          </div>
        </section>

        {/* Modal Component */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title='Örnek Modal'
          size='md'
        >
          <div className='space-y-4'>
            <p className='text-gray-600'>
              Bu bir örnek modal penceresidir. Modern tasarım ve kullanıcı dostu
              arayüz.
            </p>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h4 className='font-semibold text-blue-900 mb-2'>
                Modal Özellikleri:
              </h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• Responsive tasarım</li>
                <li>• ESC tuşu ile kapatma</li>
                <li>• Dış tıklama ile kapatma</li>
                <li>• Animasyonlu açılma/kapanma</li>
              </ul>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant='secondary'
              onClick={() => setShowModal(false)}
            >
              Kapat
            </Button>
            <Button variant='primary'>Kaydet</Button>
          </ModalFooter>
        </Modal>
      </div>
    </FirmaLayout>
  );
}
