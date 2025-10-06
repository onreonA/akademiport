'use client';
import { useState } from 'react';
import {
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiInformationLine,
} from 'react-icons/ri';

import FirmaLayout from '@/components/firma/FirmaLayout';
import designSystem from '@/lib/design-system';
export default function TestDesignPage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('option1');
  const tabs = [
    { id: 'colors', label: 'Renkler', icon: RiInformationLine },
    { id: 'typography', label: 'Tipografi', icon: RiInformationLine },
    { id: 'components', label: 'Bileşenler', icon: RiInformationLine },
    { id: 'hero', label: 'Hero Section', icon: RiInformationLine },
    { id: 'spacing', label: 'Boşluklar', icon: RiInformationLine },
    { id: 'shadows', label: 'Gölgeler', icon: RiInformationLine },
  ];
  const colorCategories = [
    { name: 'Primary', colors: designSystem.colors.primary },
    { name: 'Secondary', colors: designSystem.colors.secondary },
    { name: 'Success', colors: designSystem.colors.success },
    { name: 'Warning', colors: designSystem.colors.warning },
    { name: 'Error', colors: designSystem.colors.error },
  ];
  const gradients = [
    {
      name: 'Primary Gradient',
      gradient: designSystem.colors.gradients.primary,
    },
    {
      name: 'Secondary Gradient',
      gradient: designSystem.colors.gradients.secondary,
    },
    {
      name: 'Success Gradient',
      gradient: designSystem.colors.gradients.success,
    },
    {
      name: 'Warning Gradient',
      gradient: designSystem.colors.gradients.warning,
    },
    { name: 'Error Gradient', gradient: designSystem.colors.gradients.error },
  ];
  const fontSizes = Object.entries(designSystem.typography.fontSize);
  const fontWeights = Object.entries(designSystem.typography.fontWeight);
  const spacings = Object.entries(designSystem.spacing);
  const shadows = Object.entries(designSystem.shadows);
  return (
    <FirmaLayout
      title='Test Design System'
      description='İhracat Akademi referanslı tasarım sistemimizin tüm bileşenlerini test edin ve önizleyin'
    >
      <div className='max-w-7xl mx-auto'>
        {/* Tab Navigation */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='p-6'>
            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className='space-y-8'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Renk Paleti
                  </h2>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {colorCategories.map(category => (
                      <div key={category.name} className='space-y-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>
                          {category.name}
                        </h3>
                        <div className='grid grid-cols-5 gap-2'>
                          {Object.entries(category.colors).map(
                            ([shade, color]) => (
                              <div key={shade} className='text-center'>
                                <div
                                  className='w-16 h-16 rounded-lg shadow-sm border border-gray-200 mb-2'
                                  style={{ backgroundColor: color }}
                                />
                                <div className='text-xs text-gray-600'>
                                  {shade}
                                </div>
                                <div className='text-xs text-gray-500 font-mono'>
                                  {color}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Gradient&apos;ler
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {gradients.map(gradient => (
                      <div key={gradient.name} className='space-y-2'>
                        <div
                          className='h-20 rounded-lg shadow-sm border border-gray-200'
                          style={{ background: gradient.gradient }}
                        />
                        <div className='text-sm font-medium text-gray-800'>
                          {gradient.name}
                        </div>
                        <div className='text-xs text-gray-500 font-mono break-all'>
                          {gradient.gradient}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <div className='space-y-8'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Tipografi
                  </h2>
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Font Boyutları
                      </h3>
                      <div className='space-y-3'>
                        {fontSizes.map(([size, value]) => (
                          <div
                            key={size}
                            className='flex items-center space-x-4'
                          >
                            <div className='w-16 text-sm text-gray-600 font-mono'>
                              {size}
                            </div>
                            <div className='w-20 text-sm text-gray-500 font-mono'>
                              {value}
                            </div>
                            <div className='flex-1'>
                              <span
                                className='text-gray-900'
                                style={{ fontSize: value }}
                              >
                                The quick brown fox jumps over the lazy dog
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Font Ağırlıkları
                      </h3>
                      <div className='space-y-3'>
                        {fontWeights.map(([weight, value]) => (
                          <div
                            key={weight}
                            className='flex items-center space-x-4'
                          >
                            <div className='w-20 text-sm text-gray-600 font-mono'>
                              {weight}
                            </div>
                            <div className='w-12 text-sm text-gray-500 font-mono'>
                              {value}
                            </div>
                            <div className='flex-1'>
                              <span
                                className='text-gray-900'
                                style={{ fontWeight: value }}
                              >
                                The quick brown fox jumps over the lazy dog
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Components Tab */}
            {activeTab === 'components' && (
              <div className='space-y-8'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Bileşenler
                  </h2>
                  <div className='space-y-8'>
                    {/* Buttons */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Butonlar
                      </h3>
                      <div className='flex flex-wrap gap-4'>
                        <button
                          className={`${designSystem.components.button.base} ${designSystem.components.button.primary}`}
                        >
                          Primary Button
                        </button>
                        <button
                          className={`${designSystem.components.button.base} ${designSystem.components.button.secondary}`}
                        >
                          Secondary Button
                        </button>
                        <button
                          className={`${designSystem.components.button.base} ${designSystem.components.button.success}`}
                        >
                          Success Button
                        </button>
                        <button
                          className={`${designSystem.components.button.base} ${designSystem.components.button.warning}`}
                        >
                          Warning Button
                        </button>
                        <button
                          className={`${designSystem.components.button.base} ${designSystem.components.button.error}`}
                        >
                          Error Button
                        </button>
                        <button
                          className={`${designSystem.components.button.base} ${designSystem.components.button.outline}`}
                        >
                          Outline Button
                        </button>
                        <button
                          className={`${designSystem.components.button.base} ${designSystem.components.button.ghost}`}
                        >
                          Ghost Button
                        </button>
                      </div>
                    </div>
                    {/* Cards */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Kartlar
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div
                          className={`${designSystem.components.card.base} p-4`}
                        >
                          <h4 className='font-semibold text-gray-900 mb-2'>
                            Base Card
                          </h4>
                          <p className='text-gray-600 text-sm'>
                            Bu bir temel kart örneğidir.
                          </p>
                        </div>
                        <div
                          className={`${designSystem.components.card.elevated} p-4`}
                        >
                          <h4 className='font-semibold text-gray-900 mb-2'>
                            Elevated Card
                          </h4>
                          <p className='text-gray-600 text-sm'>
                            Bu bir yükseltilmiş kart örneğidir.
                          </p>
                        </div>
                        <div
                          className={`${designSystem.components.card.flat} p-4`}
                        >
                          <h4 className='font-semibold text-gray-900 mb-2'>
                            Flat Card
                          </h4>
                          <p className='text-gray-600 text-sm'>
                            Bu bir düz kart örneğidir.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Inputs */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Input&apos;lar
                      </h3>
                      <div className='space-y-4 max-w-md'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Normal Input
                          </label>
                          <input
                            type='text'
                            className={designSystem.components.input.base}
                            placeholder='Bir şeyler yazın...'
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Error Input
                          </label>
                          <input
                            type='text'
                            className={designSystem.components.input.error}
                            placeholder='Hata durumu...'
                          />
                        </div>
                      </div>
                    </div>
                    {/* Badges */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Rozetler
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        <span
                          className={`${designSystem.components.badge.base} ${designSystem.components.badge.primary}`}
                        >
                          Primary
                        </span>
                        <span
                          className={`${designSystem.components.badge.base} ${designSystem.components.badge.secondary}`}
                        >
                          Secondary
                        </span>
                        <span
                          className={`${designSystem.components.badge.base} ${designSystem.components.badge.success}`}
                        >
                          Success
                        </span>
                        <span
                          className={`${designSystem.components.badge.base} ${designSystem.components.badge.warning}`}
                        >
                          Warning
                        </span>
                        <span
                          className={`${designSystem.components.badge.base} ${designSystem.components.badge.error}`}
                        >
                          Error
                        </span>
                      </div>
                    </div>
                    {/* Status Icons */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Durum İkonları
                      </h3>
                      <div className='flex flex-wrap gap-6'>
                        <div className='flex items-center space-x-2'>
                          <RiCheckLine className='w-5 h-5 text-green-500' />
                          <span className='text-sm text-gray-700'>
                            Başarılı
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RiCloseLine className='w-5 h-5 text-red-500' />
                          <span className='text-sm text-gray-700'>Hata</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RiAlertLine className='w-5 h-5 text-yellow-500' />
                          <span className='text-sm text-gray-700'>Uyarı</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RiInformationLine className='w-5 h-5 text-blue-500' />
                          <span className='text-sm text-gray-700'>Bilgi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Hero Section Tab */}
            {activeTab === 'hero' && (
              <div className='space-y-8'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Hero Section Bileşenleri
                  </h2>
                  <div className='space-y-8'>
                    {/* Hero Section Örneği */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Hero Section
                      </h3>
                      <div className={`${designSystem.components.hero.base}`}>
                        <div
                          className={`${designSystem.components.hero.content}`}
                        >
                          <h1
                            className={`${designSystem.components.hero.title}`}
                          >
                            İhracat Akademi Design System
                          </h1>
                          <p
                            className={`${designSystem.components.hero.subtitle}`}
                          >
                            Modern, tutarlı ve ölçeklenebilir tasarım
                            bileşenleri ile profesyonel web uygulamaları
                            oluşturun.
                          </p>
                          <div
                            className={`${designSystem.components.hero.cta}`}
                          >
                            <button
                              className={`${designSystem.components.button.base} ${designSystem.components.button.gradient}`}
                            >
                              Başlayın
                            </button>
                            <button
                              className={`${designSystem.components.button.base} ${designSystem.components.button.outline}`}
                            >
                              Demo İzleyin
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Section Örneği */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Section Layout
                      </h3>
                      <div
                        className={`${designSystem.components.section.base}`}
                      >
                        <div
                          className={`${designSystem.components.section.container}`}
                        >
                          <h2
                            className={`${designSystem.components.section.title}`}
                          >
                            Platform Özellikleri
                          </h2>
                          <p
                            className={`${designSystem.components.section.subtitle}`}
                          >
                            İhracat Akademi ile firmanızı küresel pazarlarda
                            başarıya ulaştırın
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Stats Örneği */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        İstatistik Kartları
                      </h3>
                      <div className={`${designSystem.components.stats.base}`}>
                        <div
                          className={`${designSystem.components.stats.item}`}
                        >
                          <div
                            className={`${designSystem.components.stats.number}`}
                          >
                            1000+
                          </div>
                          <div
                            className={`${designSystem.components.stats.label}`}
                          >
                            Katılımcı Firma
                          </div>
                        </div>
                        <div
                          className={`${designSystem.components.stats.item}`}
                        >
                          <div
                            className={`${designSystem.components.stats.number}`}
                          >
                            50+
                          </div>
                          <div
                            className={`${designSystem.components.stats.label}`}
                          >
                            Hedef Ülke
                          </div>
                        </div>
                        <div
                          className={`${designSystem.components.stats.item}`}
                        >
                          <div
                            className={`${designSystem.components.stats.number}`}
                          >
                            %300
                          </div>
                          <div
                            className={`${designSystem.components.stats.label}`}
                          >
                            İhracat Artışı
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Feature Cards Örneği */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Özellik Kartları
                      </h3>
                      <div
                        className={`${designSystem.components.feature.base}`}
                      >
                        <div
                          className={`${designSystem.components.feature.card}`}
                        >
                          <div
                            className={`${designSystem.components.feature.icon}`}
                          >
                            <RiCheckLine className='w-6 h-6 text-primary-600' />
                          </div>
                          <h4
                            className={`${designSystem.components.feature.title}`}
                          >
                            Danışmanlık
                          </h4>
                          <p
                            className={`${designSystem.components.feature.description}`}
                          >
                            12 ay boyunca her firmaya özel uzman eşleştirmesi
                          </p>
                        </div>
                        <div
                          className={`${designSystem.components.feature.card}`}
                        >
                          <div
                            className={`${designSystem.components.feature.icon}`}
                          >
                            <RiInformationLine className='w-6 h-6 text-primary-600' />
                          </div>
                          <h4
                            className={`${designSystem.components.feature.title}`}
                          >
                            Eğitim ve Altyapı
                          </h4>
                          <p
                            className={`${designSystem.components.feature.description}`}
                          >
                            Panel üzerinden modüler eğitimler ve AI destekli
                            asistanlar
                          </p>
                        </div>
                        <div
                          className={`${designSystem.components.feature.card}`}
                        >
                          <div
                            className={`${designSystem.components.feature.icon}`}
                          >
                            <RiAlertLine className='w-6 h-6 text-primary-600' />
                          </div>
                          <h4
                            className={`${designSystem.components.feature.title}`}
                          >
                            Destek ve Entegrasyon
                          </h4>
                          <p
                            className={`${designSystem.components.feature.description}`}
                          >
                            Devlet teşvikleri ve pazaryeri entegrasyonları
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Spacing Tab */}
            {activeTab === 'spacing' && (
              <div className='space-y-8'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Boşluklar
                  </h2>
                  <div className='space-y-4'>
                    {spacings.map(([size, value]) => (
                      <div key={size} className='flex items-center space-x-4'>
                        <div className='w-16 text-sm text-gray-600 font-mono'>
                          {size}
                        </div>
                        <div className='w-20 text-sm text-gray-500 font-mono'>
                          {value}
                        </div>
                        <div className='flex-1'>
                          <div
                            className='bg-primary-500 h-4 rounded'
                            style={{ width: value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Shadows Tab */}
            {activeTab === 'shadows' && (
              <div className='space-y-8'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Gölgeler
                  </h2>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {shadows.map(([shadow, value]) => (
                      <div key={shadow} className='text-center'>
                        <div
                          className='w-24 h-24 bg-white rounded-lg mx-auto mb-3'
                          style={{ boxShadow: value }}
                        />
                        <div className='text-sm font-medium text-gray-800'>
                          {shadow}
                        </div>
                        <div className='text-xs text-gray-500 font-mono break-all'>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
