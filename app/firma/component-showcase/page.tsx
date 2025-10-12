'use client';

import { useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CodeBlock from '@/components/ui/CodeBlock';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import StatsCard from '@/components/ui/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Textarea from '@/components/ui/Textarea';

type TabType =
  | 'stats'
  | 'buttons'
  | 'forms'
  | 'badges'
  | 'cards'
  | 'modals'
  | 'code';

export default function ComponentShowcasePage() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: '',
  });

  // Tab configuration
  const tabs = [
    { id: 'stats' as TabType, label: 'Stats Cards', icon: 'ri-bar-chart-line' },
    {
      id: 'buttons' as TabType,
      label: 'Buttons',
      icon: 'ri-checkbox-circle-line',
    },
    {
      id: 'forms' as TabType,
      label: 'Form Components',
      icon: 'ri-file-list-line',
    },
    { id: 'badges' as TabType, label: 'Badges', icon: 'ri-price-tag-3-line' },
    { id: 'cards' as TabType, label: 'Cards', icon: 'ri-layout-grid-line' },
    { id: 'modals' as TabType, label: 'Modals', icon: 'ri-window-line' },
    {
      id: 'code' as TabType,
      label: 'Code Examples',
      icon: 'ri-code-s-slash-line',
    },
  ];

  return (
    <FirmaLayout
      title='Component Showcase'
      description='UI Component Library Showcase'
    >
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Header */}
        <div className='relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white'>
          <div className='relative z-10'>
            <div className='flex items-center gap-3 mb-4'>
              <i className='ri-palette-line text-4xl' />
              <h1 className='text-4xl font-bold'>UI Component Library</h1>
            </div>
            <p className='text-white/90 text-lg max-w-2xl'>
              Modern, reusable, and fully responsive components for the Akademi
              Port platform. Explore our comprehensive design system with
              interactive examples.
            </p>
            <div className='mt-6 flex flex-wrap gap-3'>
              <Badge variant='secondary' size='lg'>
                <i className='ri-reactjs-line mr-2' />
                React Components
              </Badge>
              <Badge variant='secondary' size='lg'>
                <i className='ri-palette-line mr-2' />
                Tailwind CSS
              </Badge>
              <Badge variant='secondary' size='lg'>
                <i className='ri-code-line mr-2' />
                TypeScript
              </Badge>
            </div>
          </div>
          {/* Decorative elements */}
          <div className='absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
          <div className='absolute -left-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
        </div>

        {/* Navigation Tabs */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-2'>
          <div className='flex flex-wrap gap-2'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <i className={tab.icon} />
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className='min-h-[600px]'>
          {/* Stats Cards Section */}
          {activeTab === 'stats' && (
            <section className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>
                    Stats Cards
                  </h2>
                  <p className='text-gray-600 mt-1'>
                    Display key metrics with beautiful stat cards
                  </p>
                </div>
                <Badge variant='info'>
                  <i className='ri-information-line mr-1' />4 Variants
                </Badge>
              </div>

              {/* Gradient Stats */}
              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <i className='ri-magic-line text-purple-500' />
                  Gradient Stats
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <StatsCard
                    icon='ri-user-line'
                    title='Toplam Kullanıcı'
                    value='1,234'
                    variant='gradient'
                    iconColor='primary'
                  />
                  <StatsCard
                    icon='ri-building-line'
                    title='Aktif Firmalar'
                    value='456'
                    variant='gradient'
                    iconColor='success'
                  />
                  <StatsCard
                    icon='ri-graduation-cap-line'
                    title='Eğitimler'
                    value='89'
                    variant='gradient'
                    iconColor='warning'
                  />
                  <StatsCard
                    icon='ri-trophy-line'
                    title='Sertifikalar'
                    value='567'
                    variant='gradient'
                    iconColor='info'
                  />
                </div>
              </div>

              {/* Default Stats with Trends */}
              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <i className='ri-line-chart-line text-blue-500' />
                  Stats with Trends
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <StatsCard
                    icon='ri-check-line'
                    title='Tamamlanan'
                    value='856'
                    variant='default'
                    iconColor='success'
                    trend='up'
                  />
                  <StatsCard
                    icon='ri-time-line'
                    title='Devam Eden'
                    value='378'
                    variant='default'
                    iconColor='warning'
                    trend='down'
                  />
                  <StatsCard
                    icon='ri-star-line'
                    title='Ortalama Puan'
                    value='4.8'
                    variant='default'
                    iconColor='info'
                    trend='up'
                  />
                  <StatsCard
                    icon='ri-trophy-line'
                    title='Başarı Oranı'
                    value='89%'
                    variant='default'
                    iconColor='primary'
                  />
                </div>
              </div>
            </section>
          )}

          {/* Buttons Section */}
          {activeTab === 'buttons' && (
            <section className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>Buttons</h2>
                  <p className='text-gray-600 mt-1'>
                    Interactive buttons with multiple variants and sizes
                  </p>
                </div>
                <Badge variant='info'>
                  <i className='ri-information-line mr-1' />6 Variants
                </Badge>
              </div>

              {/* Primary Variants */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Primary Variants
                </h3>
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
                  <Button variant='danger' icon='ri-alert-line'>
                    Danger
                  </Button>
                </div>
              </Card>

              {/* Ghost Variants */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Ghost Variants
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <Button variant='ghost' icon='ri-download-line'>
                    Download
                  </Button>
                  <Button variant='ghost' icon='ri-eye-line'>
                    View
                  </Button>
                  <Button variant='ghost' icon='ri-share-line'>
                    Share
                  </Button>
                  <Button variant='ghost' icon='ri-external-link-line'>
                    Link
                  </Button>
                </div>
              </Card>

              {/* Sizes */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Button Sizes
                </h3>
                <div className='flex flex-wrap items-center gap-4'>
                  <Button variant='primary' size='sm' icon='ri-star-line'>
                    Small
                  </Button>
                  <Button variant='primary' size='md' icon='ri-star-line'>
                    Medium
                  </Button>
                  <Button variant='primary' size='lg' icon='ri-star-line'>
                    Large
                  </Button>
                </div>
              </Card>

              {/* Loading & Disabled States */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Button States
                </h3>
                <div className='flex flex-wrap gap-4'>
                  <Button variant='primary' loading>
                    Loading...
                  </Button>
                  <Button variant='secondary' disabled>
                    Disabled
                  </Button>
                  <Button variant='success' icon='ri-check-line'>
                    Normal
                  </Button>
                </div>
              </Card>
            </section>
          )}

          {/* Forms Section */}
          {activeTab === 'forms' && (
            <section className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>
                    Form Components
                  </h2>
                  <p className='text-gray-600 mt-1'>
                    Input fields, selects, and textareas with validation support
                  </p>
                </div>
              </div>

              <Card variant='elevated'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <i className='ri-user-line mr-1' />
                      İsim
                    </label>
                    <Input
                      type='text'
                      placeholder='Adınızı girin'
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Minimum 3 karakter olmalıdır
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <i className='ri-mail-line mr-1' />
                      E-posta
                    </label>
                    <Input
                      type='email'
                      placeholder='email@example.com'
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Geçerli bir e-posta adresi girin
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <i className='ri-shield-user-line mr-1' />
                      Rol
                    </label>
                    <Select
                      value={formData.role}
                      onChange={e =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      options={[
                        { value: '', label: 'Rol seçin' },
                        { value: 'admin', label: 'Admin' },
                        { value: 'firma', label: 'Firma' },
                        { value: 'consultant', label: 'Danışman' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <i className='ri-message-3-line mr-1' />
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

                <div className='mt-6 flex justify-end gap-3'>
                  <Button
                    variant='secondary'
                    onClick={() =>
                      setFormData({
                        name: '',
                        email: '',
                        role: '',
                        message: '',
                      })
                    }
                  >
                    Temizle
                  </Button>
                  <Button variant='primary' icon='ri-save-line'>
                    Kaydet
                  </Button>
                </div>
              </Card>
            </section>
          )}

          {/* Badges Section */}
          {activeTab === 'badges' && (
            <section className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>Badges</h2>
                  <p className='text-gray-600 mt-1'>
                    Status indicators and labels
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  <i className='ri-pulse-line mr-2 text-green-500' />
                  Status Badges
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Default (with text and dot)
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      <StatusBadge status='active' />
                      <StatusBadge status='offline' />
                      <StatusBadge status='pending' />
                      <StatusBadge status='completed' />
                      <StatusBadge status='cancelled' />
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      With pulse animation
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      <StatusBadge status='active' pulse />
                      <StatusBadge status='pending' pulse />
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Different sizes
                    </p>
                    <div className='flex flex-wrap items-center gap-3'>
                      <StatusBadge status='active' size='sm' />
                      <StatusBadge status='active' size='md' />
                      <StatusBadge status='active' size='lg' />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Regular Badges */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  <i className='ri-price-tag-3-line mr-2 text-blue-500' />
                  Regular Badges
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>Variants</p>
                    <div className='flex flex-wrap gap-3'>
                      <Badge variant='primary'>Primary</Badge>
                      <Badge variant='secondary'>Secondary</Badge>
                      <Badge variant='success'>Success</Badge>
                      <Badge variant='warning'>Warning</Badge>
                      <Badge variant='error'>Error</Badge>
                      <Badge variant='info'>Info</Badge>
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>Sizes</p>
                    <div className='flex flex-wrap items-center gap-3'>
                      <Badge variant='primary' size='sm'>
                        Small
                      </Badge>
                      <Badge variant='primary' size='md'>
                        Medium
                      </Badge>
                      <Badge variant='primary' size='lg'>
                        Large
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>With icons</p>
                    <div className='flex flex-wrap gap-3'>
                      <Badge variant='success'>
                        <i className='ri-check-line mr-1' />
                        Approved
                      </Badge>
                      <Badge variant='warning'>
                        <i className='ri-time-line mr-1' />
                        Pending
                      </Badge>
                      <Badge variant='error'>
                        <i className='ri-close-line mr-1' />
                        Rejected
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Cards Section */}
          {activeTab === 'cards' && (
            <section className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>Cards</h2>
                  <p className='text-gray-600 mt-1'>
                    Container components for content organization
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card variant='base'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center'>
                      <i className='ri-layout-line text-2xl text-blue-600' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Base Card
                    </h3>
                  </div>
                  <p className='text-gray-600 mb-4'>
                    Standart kart görünümü. Hafif gölge ve beyaz arka plan.
                  </p>
                  <div className='flex gap-2'>
                    <Button variant='primary' size='sm'>
                      Devam Et
                    </Button>
                    <Button variant='ghost' size='sm'>
                      İptal
                    </Button>
                  </div>
                </Card>

                <Card variant='elevated'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center'>
                      <i className='ri-stack-line text-2xl text-purple-600' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Elevated Card
                    </h3>
                  </div>
                  <p className='text-gray-600 mb-4'>
                    Belirgin gölgeli kart. Önemli içerik için ideal.
                  </p>
                  <div className='flex gap-2'>
                    <Button variant='secondary' size='sm'>
                      İncele
                    </Button>
                    <Button variant='ghost' size='sm'>
                      Detay
                    </Button>
                  </div>
                </Card>

                <Card variant='flat'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center'>
                      <i className='ri-layout-grid-line text-2xl text-green-600' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Flat Card
                    </h3>
                  </div>
                  <p className='text-gray-600 mb-4'>
                    Düz tasarım, minimal görünüm. Liste görünümleri için.
                  </p>
                  <div className='flex gap-2'>
                    <Button variant='secondary' size='sm'>
                      Başla
                    </Button>
                    <Button variant='ghost' size='sm'>
                      Daha Fazla
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Complex Card Example */}
              <Card variant='elevated'>
                <div className='flex items-start justify-between mb-6'>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>
                      Complex Card Example
                    </h3>
                    <p className='text-gray-600'>
                      A more detailed card with multiple sections
                    </p>
                  </div>
                  <Badge variant='success'>
                    <i className='ri-check-line mr-1' />
                    Active
                  </Badge>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                  <div className='text-center p-4 bg-blue-50 rounded-lg'>
                    <i className='ri-user-line text-3xl text-blue-600 mb-2' />
                    <p className='text-2xl font-bold text-gray-900'>1,234</p>
                    <p className='text-sm text-gray-600'>Kullanıcılar</p>
                  </div>
                  <div className='text-center p-4 bg-purple-50 rounded-lg'>
                    <i className='ri-graduation-cap-line text-3xl text-purple-600 mb-2' />
                    <p className='text-2xl font-bold text-gray-900'>89</p>
                    <p className='text-sm text-gray-600'>Eğitimler</p>
                  </div>
                  <div className='text-center p-4 bg-green-50 rounded-lg'>
                    <i className='ri-trophy-line text-3xl text-green-600 mb-2' />
                    <p className='text-2xl font-bold text-gray-900'>567</p>
                    <p className='text-sm text-gray-600'>Sertifikalar</p>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <i className='ri-time-line' />
                    Son güncelleme: 2 saat önce
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='secondary' size='sm'>
                      Rapor Al
                    </Button>
                    <Button variant='primary' size='sm'>
                      Detayları Gör
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Modals Section */}
          {activeTab === 'modals' && (
            <section className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>Modals</h2>
                  <p className='text-gray-600 mt-1'>
                    Overlay dialogs for focused interactions
                  </p>
                </div>
              </div>

              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Modal Examples
                </h3>
                <p className='text-gray-600 mb-6'>
                  Modals are overlay dialogs that focus user attention on a
                  specific task. They include features like ESC key support,
                  click-outside-to-close, and smooth animations.
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Button
                    variant='primary'
                    icon='ri-window-line'
                    onClick={() => setShowModal(true)}
                  >
                    Open Modal
                  </Button>
                  <Button variant='secondary' icon='ri-information-line'>
                    Info Modal
                  </Button>
                  <Button variant='success' icon='ri-checkbox-circle-line'>
                    Success Modal
                  </Button>
                  <Button variant='danger' icon='ri-error-warning-line'>
                    Danger Modal
                  </Button>
                </div>

                <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <h4 className='font-semibold text-blue-900 mb-2 flex items-center gap-2'>
                    <i className='ri-lightbulb-line' />
                    Modal Features:
                  </h4>
                  <ul className='text-sm text-blue-800 space-y-1'>
                    <li className='flex items-start gap-2'>
                      <i className='ri-check-line mt-0.5' />
                      <span>
                        Responsive design with multiple size options (sm, md,
                        lg, xl)
                      </span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <i className='ri-check-line mt-0.5' />
                      <span>ESC key support for quick closing</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <i className='ri-check-line mt-0.5' />
                      <span>Click outside to close functionality</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <i className='ri-check-line mt-0.5' />
                      <span>Smooth animations for opening and closing</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <i className='ri-check-line mt-0.5' />
                      <span>
                        Focus trap to keep keyboard navigation within modal
                      </span>
                    </li>
                  </ul>
                </div>
              </Card>
            </section>
          )}

          {/* Code Examples Section */}
          {activeTab === 'code' && (
            <section className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>
                    Code Examples
                  </h2>
                  <p className='text-gray-600 mt-1'>
                    Ready-to-use component code snippets
                  </p>
                </div>
              </div>

              {/* Button Examples */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  <i className='ri-checkbox-circle-line mr-2 text-blue-500' />
                  Button Usage
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Basic button with icon
                    </p>
                    <CodeBlock
                      title='Button.tsx'
                      code={`<Button variant='primary' icon='ri-add-line'>
  Add Item
</Button>`}
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Button with loading state
                    </p>
                    <CodeBlock
                      title='Button.tsx'
                      code={`<Button 
  variant='primary' 
  loading={isLoading}
  onClick={handleSubmit}
>
  Save Changes
</Button>`}
                    />
                  </div>
                </div>
              </Card>

              {/* StatsCard Examples */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  <i className='ri-bar-chart-line mr-2 text-purple-500' />
                  StatsCard Usage
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Gradient stats card
                    </p>
                    <CodeBlock
                      title='StatsCard.tsx'
                      code={`<StatsCard
  icon='ri-user-line'
  title='Toplam Kullanıcı'
  value='1,234'
  variant='gradient'
  iconColor='primary'
/>`}
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Stats card with trend
                    </p>
                    <CodeBlock
                      title='StatsCard.tsx'
                      code={`<StatsCard
  icon='ri-check-line'
  title='Tamamlanan'
  value='856'
  variant='default'
  iconColor='success'
  trend='up'
/>`}
                    />
                  </div>
                </div>
              </Card>

              {/* Form Examples */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  <i className='ri-file-list-line mr-2 text-green-500' />
                  Form Components Usage
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Input with state management
                    </p>
                    <CodeBlock
                      title='Form.tsx'
                      code={`const [email, setEmail] = useState('');

<Input
  type='email'
  placeholder='email@example.com'
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>`}
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Select with options
                    </p>
                    <CodeBlock
                      title='Select.tsx'
                      code={`<Select
  value={selectedRole}
  onChange={(e) => setSelectedRole(e.target.value)}
  options={[
    { value: '', label: 'Rol seçin' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
  ]}
/>`}
                    />
                  </div>
                </div>
              </Card>

              {/* Badge Examples */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  <i className='ri-price-tag-3-line mr-2 text-yellow-500' />
                  Badge Usage
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>Status badge</p>
                    <CodeBlock
                      title='StatusBadge.tsx'
                      code={`<StatusBadge status='active' pulse />
<StatusBadge status='pending' />
<StatusBadge status='completed' />`}
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Regular badge with icon
                    </p>
                    <CodeBlock
                      title='Badge.tsx'
                      code={`<Badge variant='success'>
  <i className='ri-check-line mr-1' />
  Approved
</Badge>`}
                    />
                  </div>
                </div>
              </Card>

              {/* Modal Examples */}
              <Card variant='elevated'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  <i className='ri-window-line mr-2 text-pink-500' />
                  Modal Usage
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>Basic modal</p>
                    <CodeBlock
                      title='Modal.tsx'
                      code={`const [showModal, setShowModal] = useState(false);

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title='Confirm Action'
  size='md'
>
  <p>Are you sure you want to proceed?</p>
  <ModalFooter>
    <Button variant='secondary' onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button variant='primary'>
      Confirm
    </Button>
  </ModalFooter>
</Modal>`}
                    />
                  </div>
                </div>
              </Card>
            </section>
          )}
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title='Örnek Modal'
        size='md'
      >
        <div className='space-y-4'>
          <div className='flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg'>
            <div className='w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center'>
              <i className='ri-information-line text-2xl text-blue-600' />
            </div>
            <div>
              <h4 className='font-semibold text-gray-900'>Modal Example</h4>
              <p className='text-sm text-gray-600'>
                This demonstrates a modal dialog
              </p>
            </div>
          </div>

          <p className='text-gray-600'>
            Bu bir örnek modal penceresidir. Modern tasarım ve kullanıcı dostu
            arayüz özellikleri içerir. Form girişleri, onay diyalogları, veya
            detaylı bilgi gösterimi için kullanılabilir.
          </p>

          <div className='grid grid-cols-2 gap-4'>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <i className='ri-check-line text-green-600 text-xl mb-2' />
              <p className='text-sm font-medium text-gray-900'>Responsive</p>
              <p className='text-xs text-gray-600'>
                Tüm ekran boyutlarında çalışır
              </p>
            </div>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <i className='ri-palette-line text-purple-600 text-xl mb-2' />
              <p className='text-sm font-medium text-gray-900'>Customizable</p>
              <p className='text-xs text-gray-600'>Kolay özelleştirilebilir</p>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Kapat
          </Button>
          <Button variant='primary' icon='ri-save-line'>
            Kaydet
          </Button>
        </ModalFooter>
      </Modal>
    </FirmaLayout>
  );
}
