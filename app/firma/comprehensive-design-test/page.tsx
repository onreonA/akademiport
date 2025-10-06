'use client';

import { useState } from 'react';
import {
  RiCodeLine,
  RiDownloadLine,
  RiEyeLine,
  RiGradienterLine,
  RiHeartLine,
  RiInformationLine,
  RiLayoutLine,
  RiPaletteLine,
  RiPlayLine,
  RiRefreshLine,
  RiSettingsLine,
  RiShieldLine,
  RiStarLine,
  RiText,
} from 'react-icons/ri';

import designSystem from '@/lib/design-system';

export default function ComprehensiveDesignTestPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('option1');
  const [progressValue, setProgressValue] = useState(65);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: RiEyeLine },
    { id: 'colors', label: 'Renk Paleti', icon: RiPaletteLine },
    { id: 'typography', label: 'Tipografi', icon: RiText },
    { id: 'components', label: 'Bileşenler', icon: RiLayoutLine },
    { id: 'gradients', label: 'Gradient&apos;ler', icon: RiGradienterLine },
    { id: 'spacing', label: 'Boşluklar', icon: RiSettingsLine },
    { id: 'shadows', label: 'Gölgeler', icon: RiShieldLine },
    { id: 'animations', label: 'Animasyonlar', icon: RiCodeLine },
    { id: 'hero-sections', label: 'Hero Bölümleri', icon: RiStarLine },
    { id: 'cards', label: 'Kart Tasarımları', icon: RiInformationLine },
    { id: 'buttons', label: 'Butonlar', icon: RiCodeLine },
    { id: 'forms', label: 'Form Elementleri', icon: RiSettingsLine },
  ];

  const colorCategories = [
    {
      name: 'Primary (Ana Mavi)',
      colors: designSystem.colors.primary,
      description: 'Ana marka rengi - İhracat Akademi mavisi',
    },
    {
      name: 'Secondary (Gri)',
      colors: designSystem.colors.secondary,
      description: 'Nötr renkler - Metin ve arka planlar',
    },
    {
      name: 'Success (Yeşil)',
      colors: designSystem.colors.success,
      description: 'Başarı durumları - Onay ve tamamlama',
    },
    {
      name: 'Warning (Sarı)',
      colors: designSystem.colors.warning,
      description: 'Uyarı durumları - Dikkat gerektiren işlemler',
    },
    {
      name: 'Error (Kırmızı)',
      colors: designSystem.colors.error,
      description: 'Hata durumları - Kritik uyarılar',
    },
  ];

  const gradients = [
    {
      name: 'Primary Gradient',
      gradient: designSystem.colors.gradients.primary,
      description: 'Ana buton ve CTA gradient',
    },
    {
      name: 'Secondary Gradient',
      gradient: designSystem.colors.gradients.secondary,
      description: 'İkincil elementler için',
    },
    {
      name: 'Success Gradient',
      gradient: designSystem.colors.gradients.success,
      description: 'Başarı durumları için',
    },
    {
      name: 'Warning Gradient',
      gradient: designSystem.colors.gradients.warning,
      description: 'Uyarı durumları için',
    },
    {
      name: 'Error Gradient',
      gradient: designSystem.colors.gradients.error,
      description: 'Hata durumları için',
    },
    {
      name: 'Hero Gradient',
      gradient: designSystem.colors.gradients.hero,
      description: 'Ana sayfa hero section',
    },
    {
      name: 'Card Gradient',
      gradient: designSystem.colors.gradients.card,
      description: 'Kart arka planları için',
    },
    {
      name: 'Glass Gradient',
      gradient: designSystem.colors.gradients.glass,
      description: 'Cam efekti için',
    },
  ];

  const fontSizes = Object.entries(designSystem.typography.fontSize);
  const fontWeights = Object.entries(designSystem.typography.fontWeight);
  const spacings = Object.entries(designSystem.spacing);
  const shadows = Object.entries(designSystem.shadows);
  const borderRadius = Object.entries(designSystem.borderRadius);

  const handleButtonClick = (type: string) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
    // Button clicked: ${type}
  };

  const ColorSwatch = ({
    name,
    color,
    description,
  }: {
    name: string;
    color: string;
    description: string;
  }) => (
    <div className={`${designSystem.components.card.base} p-4 text-center`}>
      <div
        className='w-full h-16 rounded-lg mb-3 border border-gray-200'
        style={{ backgroundColor: color }}
      ></div>
      <p
        className={`text-xs font-medium ${designSystem.colors.secondary[700]} mb-1`}
      >
        {name}
      </p>
      <p className={`text-xs ${designSystem.colors.secondary[500]} font-mono`}>
        {color}
      </p>
    </div>
  );

  const GradientSwatch = ({
    name,
    gradient,
    description,
  }: {
    name: string;
    gradient: string;
    description: string;
  }) => (
    <div className={`${designSystem.components.card.base} p-4 text-center`}>
      <div
        className='w-full h-16 rounded-lg mb-3 border border-gray-200'
        style={{ background: gradient }}
      ></div>
      <p
        className={`text-xs font-medium ${designSystem.colors.secondary[700]} mb-1`}
      >
        {name}
      </p>
      <p className={`text-xs ${designSystem.colors.secondary[500]} mb-2`}>
        {description}
      </p>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Tab Navigation */}
      <div className={`${designSystem.components.card.base} p-4`}>
        <div className='flex flex-wrap gap-2'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${designSystem.components.tab.base} ${
                activeTab === tab.id
                  ? designSystem.components.tab.active
                  : designSystem.components.tab.inactive
              } flex items-center gap-2`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`${designSystem.components.card.base} p-4`}>
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* Quick Stats */}
            <div className={`${designSystem.components.stats.base}`}>
              <div className={`${designSystem.components.stats.item}`}>
                <div className={`${designSystem.components.stats.number}`}>
                  50
                </div>
                <div className={`${designSystem.components.stats.label}`}>
                  Renk Tonu
                </div>
              </div>
              <div className={`${designSystem.components.stats.item}`}>
                <div className={`${designSystem.components.stats.number}`}>
                  8
                </div>
                <div className={`${designSystem.components.stats.label}`}>
                  Gradient
                </div>
              </div>
              <div className={`${designSystem.components.stats.item}`}>
                <div className={`${designSystem.components.stats.number}`}>
                  15
                </div>
                <div className={`${designSystem.components.stats.label}`}>
                  Component Stili
                </div>
              </div>
            </div>

            {/* Hero Section Preview */}
            <div
              className={`${designSystem.components.hero.base} p-8 rounded-xl`}
            >
              <div
                className={`${designSystem.components.hero.content} text-center`}
              >
                <h3
                  className={`${designSystem.components.hero.title} text-2xl md:text-3xl`}
                >
                  Hero Section Önizlemesi
                </h3>
                <p
                  className={`${designSystem.components.hero.subtitle} text-base md:text-lg`}
                >
                  Ana sayfa hero section tasarımının nasıl göründüğünü burada
                  görebilirsiniz.
                </p>
                <div
                  className={`${designSystem.components.hero.cta} justify-center`}
                >
                  <button
                    className={`${designSystem.components.button.base} ${designSystem.components.button.primary}`}
                    onClick={() => handleButtonClick('hero-primary')}
                  >
                    <RiPlayLine className='w-4 h-4 mr-2' />
                    Demo Butonu
                  </button>
                  <button
                    className={`${designSystem.components.button.base} ${designSystem.components.button.outline}`}
                    onClick={() => handleButtonClick('hero-outline')}
                  >
                    <RiInformationLine className='w-4 h-4 mr-2' />
                    Daha Fazla Bilgi
                  </button>
                </div>
              </div>
            </div>

            {/* Component Showcase */}
            <div>
              <h3
                className={`text-2xl font-bold ${designSystem.colors.secondary[900]} mb-6`}
              >
                Hızlı Component Önizlemesi
              </h3>
              <div className={`${designSystem.components.feature.base}`}>
                <div className={`${designSystem.components.feature.card}`}>
                  <div className={`${designSystem.components.feature.icon}`}>
                    <RiStarLine
                      className={`w-6 h-6 ${designSystem.colors.primary[600]}`}
                    />
                  </div>
                  <h4 className={`${designSystem.components.feature.title}`}>
                    Button Component
                  </h4>
                  <p
                    className={`${designSystem.components.feature.description}`}
                  >
                    7 farklı buton stili ile tüm ihtiyaçlarınızı karşılayın.
                  </p>
                </div>
                <div className={`${designSystem.components.feature.card}`}>
                  <div className={`${designSystem.components.feature.icon}`}>
                    <RiLayoutLine
                      className={`w-6 h-6 ${designSystem.colors.success[600]}`}
                    />
                  </div>
                  <h4 className={`${designSystem.components.feature.title}`}>
                    Card Component
                  </h4>
                  <p
                    className={`${designSystem.components.feature.description}`}
                  >
                    5 farklı kart stili ile içeriklerinizi düzenleyin.
                  </p>
                </div>
                <div className={`${designSystem.components.feature.card}`}>
                  <div className={`${designSystem.components.feature.icon}`}>
                    <RiPaletteLine
                      className={`w-6 h-6 ${designSystem.colors.warning[600]}`}
                    />
                  </div>
                  <h4 className={`${designSystem.components.feature.title}`}>
                    Color System
                  </h4>
                  <p
                    className={`${designSystem.components.feature.description}`}
                  >
                    50 farklı renk tonu ile tutarlı tasarım.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className='space-y-8'>
            <div className='text-center mb-8'>
              <h2
                className={`text-3xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Renk Paleti Sistemi
              </h2>
              <p className={`text-lg ${designSystem.colors.secondary[600]}`}>
                İhracat Akademi marka kimliği ile uyumlu 50 farklı renk tonu
              </p>
            </div>

            {colorCategories.map(category => (
              <div key={category.name} className='space-y-4'>
                <div className='border-l-4 border-primary-500 pl-4'>
                  <h3
                    className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
                  >
                    {category.name}
                  </h3>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    {category.description}
                  </p>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3'>
                  {Object.entries(category.colors).map(([key, value]) => (
                    <ColorSwatch
                      key={key}
                      name={`${category.name.split(' ')[0]} ${key}`}
                      color={value}
                      description=''
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'typography' && (
          <div className='space-y-8'>
            <div className='text-center mb-8'>
              <h2
                className={`text-3xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Tipografi Sistemi
              </h2>
              <p className={`text-lg ${designSystem.colors.secondary[600]}`}>
                Font aileleri, boyutlar ve ağırlıklar
              </p>
            </div>

            {/* Font Families */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Font Aileleri
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {Object.entries(designSystem.typography.fontFamily).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className={`${designSystem.components.card.base} p-4`}
                    >
                      <h4
                        className={`font-medium ${designSystem.colors.secondary[700]} mb-2`}
                      >
                        {key}
                      </h4>
                      <p
                        className={`text-sm ${designSystem.colors.secondary[600]} font-mono mb-2`}
                      >
                        {Array.isArray(value) ? value.join(', ') : value}
                      </p>
                      <p
                        className={`text-lg ${key === 'sans' ? 'font-sans' : key === 'serif' ? 'font-serif' : 'font-mono'}`}
                      >
                        Örnek metin: {key} font ailesi
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Font Sizes */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Font Boyutları
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {fontSizes.map(([key, value]) => (
                  <div
                    key={key}
                    className={`${designSystem.components.card.base} p-4 flex items-center justify-between`}
                  >
                    <span
                      className={`font-medium ${designSystem.colors.secondary[700]}`}
                    >
                      {key}
                    </span>
                    <span
                      className={`${designSystem.colors.secondary[600]} font-mono text-sm`}
                    >
                      {value}
                    </span>
                    <span
                      style={{ fontSize: value }}
                      className={`${designSystem.colors.secondary[900]}`}
                    >
                      Örnek metin
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Font Weights */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Font Ağırlıkları
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {fontWeights.map(([key, value]) => (
                  <div
                    key={key}
                    className={`${designSystem.components.card.base} p-4 text-center`}
                  >
                    <p
                      className={`font-medium ${designSystem.colors.secondary[700]} mb-2`}
                    >
                      {key}
                    </p>
                    <p
                      className={`${designSystem.colors.secondary[600]} font-mono text-sm mb-2`}
                    >
                      {value}
                    </p>
                    <p
                      className={`text-lg ${designSystem.colors.secondary[900]}`}
                      style={{ fontWeight: value }}
                    >
                      Örnek metin
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className='space-y-8'>
            <div className='text-center mb-8'>
              <h2
                className={`text-3xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Component Stilleri
              </h2>
              <p className={`text-lg ${designSystem.colors.secondary[600]}`}>
                Tüm kullanılabilir component stilleri ve varyantları
              </p>
            </div>

            {/* Buttons */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Button Component
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.primary}`}
                  onClick={() => handleButtonClick('primary')}
                >
                  Primary
                </button>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.secondary}`}
                  onClick={() => handleButtonClick('secondary')}
                >
                  Secondary
                </button>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.success}`}
                  onClick={() => handleButtonClick('success')}
                >
                  Success
                </button>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.warning}`}
                  onClick={() => handleButtonClick('warning')}
                >
                  Warning
                </button>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.error}`}
                  onClick={() => handleButtonClick('error')}
                >
                  Error
                </button>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.outline}`}
                  onClick={() => handleButtonClick('outline')}
                >
                  Outline
                </button>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.ghost}`}
                  onClick={() => handleButtonClick('ghost')}
                >
                  Ghost
                </button>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.gradient}`}
                  onClick={() => handleButtonClick('gradient')}
                >
                  Gradient
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Card Component
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className={`${designSystem.components.card.base} p-6`}>
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Base Card
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Temel kart stili
                  </p>
                </div>
                <div className={`${designSystem.components.card.elevated} p-6`}>
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Elevated Card
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Yüksek gölgeli kart
                  </p>
                </div>
                <div className={`${designSystem.components.card.flat} p-6`}>
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Flat Card
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Düz kart stili
                  </p>
                </div>
                <div className={`${designSystem.components.card.glass} p-6`}>
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Glass Card
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Cam efekti kart
                  </p>
                </div>
                <div className={`${designSystem.components.card.gradient} p-6`}>
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Gradient Card
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Gradient arka planlı kart
                  </p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Input Component
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label
                    className={`block text-sm font-medium ${designSystem.colors.secondary[700]} mb-2`}
                  >
                    Base Input
                  </label>
                  <input
                    type='text'
                    placeholder='Normal input'
                    className={`${designSystem.components.input.base}`}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${designSystem.colors.secondary[700]} mb-2`}
                  >
                    Error Input
                  </label>
                  <input
                    type='text'
                    placeholder='Hata durumu'
                    className={`${designSystem.components.input.error}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${designSystem.colors.secondary[700]} mb-2`}
                  >
                    Glass Input
                  </label>
                  <input
                    type='text'
                    placeholder='Cam efekti'
                    className={`${designSystem.components.input.glass}`}
                  />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Badge Component
              </h3>
              <div className='flex flex-wrap gap-3'>
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
                <span
                  className={`${designSystem.components.badge.base} ${designSystem.components.badge.gradient}`}
                >
                  Gradient
                </span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Progress Component
              </h3>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className={`${designSystem.colors.secondary[700]}`}>
                      Primary Progress
                    </span>
                    <span className={`${designSystem.colors.secondary[600]}`}>
                      {progressValue}%
                    </span>
                  </div>
                  <div className={`${designSystem.components.progress.base}`}>
                    <div
                      className={`${designSystem.components.progress.bar}`}
                      style={{ width: `${progressValue}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className={`${designSystem.colors.secondary[700]}`}>
                      Success Progress
                    </span>
                    <span className={`${designSystem.colors.secondary[600]}`}>
                      85%
                    </span>
                  </div>
                  <div className={`${designSystem.components.progress.base}`}>
                    <div
                      className={`${designSystem.components.progress.barSuccess}`}
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className={`${designSystem.colors.secondary[700]}`}>
                      Warning Progress
                    </span>
                    <span className={`${designSystem.colors.secondary[600]}`}>
                      45%
                    </span>
                  </div>
                  <div className={`${designSystem.components.progress.base}`}>
                    <div
                      className={`${designSystem.components.progress.barWarning}`}
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className={`${designSystem.colors.secondary[700]}`}>
                      Error Progress
                    </span>
                    <span className={`${designSystem.colors.secondary[600]}`}>
                      20%
                    </span>
                  </div>
                  <div className={`${designSystem.components.progress.base}`}>
                    <div
                      className={`${designSystem.components.progress.barError}`}
                      style={{ width: '20%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            <div className='space-y-4'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Loading State
              </h3>
              <div className='flex items-center gap-4'>
                <button
                  className={`${designSystem.components.button.base} ${designSystem.components.button.primary} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleButtonClick('loading')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <RiRefreshLine className='w-4 h-4 mr-2' />
                      Test Loading
                    </>
                  )}
                </button>
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600'></div>
                  <span
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Loading spinner
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gradients' && (
          <div className='space-y-8'>
            <div className='text-center mb-8'>
              <h2
                className={`text-3xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Gradient Sistemi
              </h2>
              <p className={`text-lg ${designSystem.colors.secondary[600]}`}>
                8 farklı gradient stili ile modern tasarımlar
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {gradients.map(gradient => (
                <GradientSwatch
                  key={gradient.name}
                  name={gradient.name}
                  gradient={gradient.gradient}
                  description={gradient.description}
                />
              ))}
            </div>

            {/* Gradient Usage Examples */}
            <div className='space-y-6'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                Gradient Kullanım Örnekleri
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div
                  className='p-8 rounded-xl text-white'
                  style={{ background: designSystem.colors.gradients.hero }}
                >
                  <h4 className='text-xl font-bold mb-2'>Hero Section</h4>
                  <p className='text-white/90 mb-4'>
                    Ana sayfa hero section için kullanılan gradient
                  </p>
                  <button className='bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors'>
                    CTA Button
                  </button>
                </div>

                <div
                  className='p-8 rounded-xl text-white'
                  style={{
                    background: designSystem.colors.gradients.primary,
                  }}
                >
                  <h4 className='text-xl font-bold mb-2'>Primary Gradient</h4>
                  <p className='text-white/90 mb-4'>
                    Butonlar ve önemli elementler için
                  </p>
                  <button className='bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors'>
                    Action Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className='space-y-8'>
            <div className='text-center mb-8'>
              <h2
                className={`text-3xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Spacing Sistemi
              </h2>
              <p className={`text-lg ${designSystem.colors.secondary[600]}`}>
                Tutarlı boşluk değerleri ile düzenli layout
              </p>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
              {spacings.map(([key, value]) => (
                <div
                  key={key}
                  className={`${designSystem.components.card.base} p-4 text-center`}
                >
                  <div
                    className='bg-primary-500 mx-auto mb-2'
                    style={{
                      width: value,
                      height: value,
                      minWidth: '8px',
                      minHeight: '8px',
                    }}
                  ></div>
                  <p
                    className={`text-xs font-medium ${designSystem.colors.secondary[700]}`}
                  >
                    {key}
                  </p>
                  <p
                    className={`text-xs ${designSystem.colors.secondary[500]} font-mono`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shadows' && (
          <div className='space-y-8'>
            <div className='text-center mb-8'>
              <h2
                className={`text-3xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Shadow Sistemi
              </h2>
              <p className={`text-lg ${designSystem.colors.secondary[600]}`}>
                Derinlik ve katman hissi veren gölge efektleri
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {shadows.map(([key, value]) => (
                <div key={key} className='text-center'>
                  <div
                    className={`bg-white rounded-xl p-8 mb-4 ${key === 'none' ? 'border border-gray-200' : ''}`}
                    style={{ boxShadow: value }}
                  >
                    <div
                      className={`w-12 h-12 bg-primary-100 rounded-lg mx-auto flex items-center justify-center`}
                    >
                      <RiShieldLine
                        className={`w-6 h-6 ${designSystem.colors.primary[600]}`}
                      />
                    </div>
                  </div>
                  <p
                    className={`text-sm font-medium ${designSystem.colors.secondary[700]}`}
                  >
                    {key}
                  </p>
                  <p
                    className={`text-xs ${designSystem.colors.secondary[500]} font-mono mt-1`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'animations' && (
          <div className='space-y-8'>
            <div className='text-center mb-8'>
              <h2
                className={`text-3xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Animation Sistemi
              </h2>
              <p className={`text-lg ${designSystem.colors.secondary[600]}`}>
                Smooth geçişler ve animasyon efektleri
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='space-y-4'>
                <h3
                  className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
                >
                  Duration
                </h3>
                {Object.entries(designSystem.animations.duration).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className={`${designSystem.components.card.base} p-4`}
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <span
                          className={`font-medium ${designSystem.colors.secondary[700]}`}
                        >
                          {key}
                        </span>
                        <span
                          className={`text-sm ${designSystem.colors.secondary[500]} font-mono`}
                        >
                          {value}
                        </span>
                      </div>
                      <div className='w-full h-2 bg-primary-200 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary-500 rounded-full animate-pulse'
                          style={{ animationDuration: value }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className='space-y-4'>
                <h3
                  className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
                >
                  Easing
                </h3>
                {Object.entries(designSystem.animations.easing).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className={`${designSystem.components.card.base} p-4`}
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <span
                          className={`font-medium ${designSystem.colors.secondary[700]}`}
                        >
                          {key}
                        </span>
                        <span
                          className={`text-sm ${designSystem.colors.secondary[500]} font-mono`}
                        >
                          {value}
                        </span>
                      </div>
                      <div className='w-full h-2 bg-secondary-200 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-secondary-500 rounded-full'
                          style={{
                            animation: `ease-demo 2s infinite`,
                            animationTimingFunction: value,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Interactive Animation Examples */}
            <div className='space-y-6'>
              <h3
                className={`text-xl font-bold ${designSystem.colors.secondary[900]}`}
              >
                İnteraktif Animasyon Örnekleri
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div
                  className={`${designSystem.components.card.base} p-6 text-center hover:scale-105 transition-transform duration-300`}
                >
                  <RiHeartLine
                    className={`w-12 h-12 ${designSystem.colors.error[500]} mx-auto mb-4`}
                  />
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Hover Scale
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Üzerine gelince büyür
                  </p>
                </div>

                <div
                  className={`${designSystem.components.card.base} p-6 text-center hover:shadow-lg transition-shadow duration-300`}
                >
                  <RiStarLine
                    className={`w-12 h-12 ${designSystem.colors.warning[500]} mx-auto mb-4`}
                  />
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Hover Shadow
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Üzerine gelince gölge
                  </p>
                </div>

                <div
                  className={`${designSystem.components.card.base} p-6 text-center hover:rotate-3 transition-transform duration-300`}
                >
                  <RiRefreshLine
                    className={`w-12 h-12 ${designSystem.colors.primary[500]} mx-auto mb-4`}
                  />
                  <h4
                    className={`font-semibold ${designSystem.colors.secondary[900]} mb-2`}
                  >
                    Hover Rotate
                  </h4>
                  <p
                    className={`text-sm ${designSystem.colors.secondary[600]}`}
                  >
                    Üzerine gelince döner
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Sections Tab */}
        {activeTab === 'hero-sections' && (
          <div className='space-y-8'>
            <div>
              <h3
                className={`text-2xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Hero Bölümleri
              </h3>
              <p className={`${designSystem.colors.secondary[600]} mb-6`}>
                Projedeki farklı sayfalardan çıkarılan hero section tasarımları
              </p>
            </div>

            {/* Ana Sayfa Hero */}
            <div
              className={`${designSystem.components.card.base} overflow-hidden`}
            >
              <div className='bg-gradient-to-br from-blue-600 via-purple-700 to-orange-500 p-8 text-white relative'>
                <div className='absolute inset-0 bg-black/20'></div>
                <div className='relative z-10'>
                  <div className='inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/30'>
                    <RiStarLine className='text-white mr-2 w-5 h-5' />
                    <span className='text-white font-semibold text-sm tracking-wide'>
                      TİCARET BAKANLIĞI DESTEKLİ
                    </span>
                  </div>
                  <h1 className='text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight'>
                    Türkiye&apos;nin E-İhracat Kapasitesini
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300'>
                      {' '}
                      Birlikte Yükseltiyoruz
                    </span>
                  </h1>
                  <p className='text-xl text-white/90 mb-8 leading-relaxed'>
                    Ticaret Bakanlığı destekleriyle, sanayi ve ticaret
                    odalarının organizasyonunda yürütülen bu proje; üretici
                    firmaları 12 ay süren bir e-ihracat dönüşüm yolculuğuna
                    davet ediyor.
                  </p>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    <button className='inline-flex items-center bg-white text-blue-600 text-lg px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg'>
                      <RiEyeLine className='mr-2 w-5 h-5' />
                      Programı İncele
                    </button>
                    <button className='inline-flex items-center bg-transparent border-2 border-white text-white text-lg px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300'>
                      Başvuru Yap
                      <RiStarLine className='ml-2 w-5 h-5' />
                    </button>
                  </div>
                </div>
              </div>
              <div className='p-6 bg-gray-50'>
                <h4 className='font-semibold text-gray-900 mb-2'>
                  Ana Sayfa Hero
                </h4>
                <p className='text-sm text-gray-600'>
                  bg-gradient-to-br from-blue-600 via-purple-700 to-orange-500
                </p>
              </div>
            </div>

            {/* Destekler Hero */}
            <div
              className={`${designSystem.components.card.base} overflow-hidden`}
            >
              <div className='bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white relative'>
                <div className='absolute inset-0 bg-black/20'></div>
                <div className='relative z-10 text-center'>
                  <div className='inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6'>
                    <RiShieldLine className='text-blue-400 mr-2 w-5 h-5' />
                    <span className='text-white font-medium'>
                      Güvenilir Destek Sistemi
                    </span>
                  </div>
                  <h1 className='text-5xl md:text-6xl font-black text-white mb-6 leading-tight'>
                    Firmalara Sağlanan
                    <span className='bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                      {' '}
                      Destekler
                    </span>
                  </h1>
                  <p className='text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed'>
                    E-ihracat yolculuğunuzda ihtiyaç duyacağınız tüm desteği
                    sistematik ve profesyonel şekilde sunuyoruz.
                  </p>
                </div>
              </div>
              <div className='p-6 bg-gray-50'>
                <h4 className='font-semibold text-gray-900 mb-2'>
                  Destekler Hero
                </h4>
                <p className='text-sm text-gray-600'>
                  bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900
                </p>
              </div>
            </div>

            {/* Program Hakkında Hero */}
            <div
              className={`${designSystem.components.card.base} overflow-hidden`}
            >
              <div className='bg-gradient-to-br from-blue-50 via-purple-50 to-white p-8 relative'>
                <div className='text-center'>
                  <div className='inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-8 py-3 mb-8'>
                    <RiInformationLine className='text-blue-600 mr-3 w-6 h-6' />
                    <span className='text-blue-800 font-bold text-lg tracking-wide'>
                      📘 PROGRAM HAKKINDA
                    </span>
                  </div>
                  <h1 className='text-4xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight'>
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>
                      Yeni Nesil
                    </span>
                    <br />
                    E-İhracat Dönüşüm Modeli
                  </h1>
                  <p className='text-xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto'>
                    Bu program,{' '}
                    <strong className='text-blue-700'>
                      Ticaret Bakanlığı destekleriyle
                    </strong>{' '}
                    organize edilen, sanayi ve ticaret odalarının
                    koordinasyonunda yürütülen bir e-ihracat gelişim modelidir.
                  </p>
                </div>
              </div>
              <div className='p-6 bg-gray-50'>
                <h4 className='font-semibold text-gray-900 mb-2'>
                  Program Hakkında Hero
                </h4>
                <p className='text-sm text-gray-600'>
                  bg-gradient-to-br from-blue-50 via-purple-50 to-white
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className='space-y-8'>
            <div>
              <h3
                className={`text-2xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Kart Tasarımları
              </h3>
              <p className={`${designSystem.colors.secondary[600]} mb-6`}>
                Projedeki farklı sayfalardan çıkarılan kart tasarım örnekleri
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Başarı Hikayesi Kartı */}
              <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden'>
                <div className='p-6 pb-0'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
                        <RiStarLine className='text-white text-2xl w-8 h-8' />
                      </div>
                      <div>
                        <h3 className='text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200'>
                          Demir Tekstil A.Ş.
                        </h3>
                        <p className='text-gray-600 text-sm'>
                          Tekstil ve Konfeksiyon
                        </p>
                        <div className='flex items-center mt-1'>
                          <RiEyeLine className='text-gray-400 mr-1 w-4 h-4' />
                          <span className='text-gray-500 text-sm'>Bursa</span>
                        </div>
                      </div>
                    </div>
                    <div className='bg-green-100 rounded-full px-3 py-1'>
                      <span className='text-green-700 font-bold text-sm'>
                        +400%
                      </span>
                    </div>
                  </div>
                </div>
                <div className='px-6 pb-6'>
                  <p className='text-gray-700 mb-6 leading-relaxed'>
                    Yerel üretimden küresel e-ticaret devi Amazon ve
                    Alibaba&apos;ya uzanan başarı hikayesi
                  </p>
                  <div className='flex flex-wrap gap-2 mb-6'>
                    <span className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium'>
                      E-Ticaret
                    </span>
                    <span className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium'>
                      Alibaba
                    </span>
                    <span className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium'>
                      Amazon
                    </span>
                  </div>
                  <button className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 group-hover:shadow-lg'>
                    Detayları Gör
                    <RiEyeLine className='ml-2 w-4 h-4 inline-flex items-center justify-center' />
                  </button>
                </div>
              </div>

              {/* Destek Kartı */}
              <div className='bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                  <RiSettingsLine className='text-white text-2xl w-8 h-8' />
                </div>
                <h3 className='text-xl font-bold text-blue-800 mb-3 text-center'>
                  Stratejik Danışmanlık
                </h3>
                <p className='text-gray-600 text-sm text-center leading-relaxed mb-4'>
                  Firma analizi, ürün konumlandırma ve hedef pazar stratejileri
                </p>
                <div className='flex justify-center'>
                  <div className='w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 animate-pulse'></div>
                </div>
              </div>

              {/* İstatistik Kartı */}
              <div className='bg-white rounded-2xl p-6 text-center shadow-lg border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <RiStarLine className='text-white text-2xl w-8 h-8' />
                </div>
                <div className='text-3xl font-bold text-purple-700 mb-2'>
                  10x
                </div>
                <div className='text-purple-600 text-sm'>Hız Artışı</div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons Tab */}
        {activeTab === 'buttons' && (
          <div className='space-y-8'>
            <div>
              <h3
                className={`text-2xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Buton Tasarımları
              </h3>
              <p className={`${designSystem.colors.secondary[600]} mb-6`}>
                Projedeki farklı sayfalardan çıkarılan buton tasarım örnekleri
              </p>
            </div>

            <div className='space-y-6'>
              {/* Primary Buttons */}
              <div>
                <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                  Primary Buttons
                </h4>
                <div className='flex flex-wrap gap-4'>
                  <button className='inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-10 py-5 rounded-2xl font-bold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-2xl hover:shadow-3xl transform hover:-translate-y-1'>
                    <RiStarLine className='mr-3 w-6 h-6' />
                    Programa Katıl
                  </button>
                  <button className='inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap'>
                    <RiPlayLine className='mr-2 w-5 h-5' />
                    Demo İzle
                  </button>
                  <button className='inline-flex items-center bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-xl text-xl'>
                    <RiStarLine className='mr-3 w-6 h-6' />
                    Hemen Başlat
                  </button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div>
                <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                  Secondary Buttons
                </h4>
                <div className='flex flex-wrap gap-4'>
                  <button className='inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 text-xl px-10 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl'>
                    <RiPlayLine className='mr-3 w-6 h-6' />
                    Demo İzle
                  </button>
                  <button className='inline-flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap'>
                    Detaylı Bilgi Al
                  </button>
                  <button className='inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 cursor-pointer whitespace-nowrap'>
                    Başvuru Yap
                    <RiStarLine className='ml-2 w-5 h-5' />
                  </button>
                </div>
              </div>

              {/* Filter Buttons */}
              <div>
                <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                  Filter & Tab Buttons
                </h4>
                <div className='flex flex-wrap gap-4'>
                  <button className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap bg-blue-600 text-white shadow-lg'>
                    Tümü
                  </button>
                  <button className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200'>
                    Tekstil ve Konfeksiyon
                  </button>
                  <button className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200'>
                    Gıda ve İçecek
                  </button>
                  <button className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200'>
                    Teknoloji ve Yazılım
                  </button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div>
                <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                  Icon Buttons
                </h4>
                <div className='flex flex-wrap gap-4'>
                  <button className='w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'>
                    <RiEyeLine className='w-6 h-6' />
                  </button>
                  <button className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'>
                    <RiStarLine className='w-6 h-6' />
                  </button>
                  <button className='w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'>
                    <RiHeartLine className='w-6 h-6' />
                  </button>
                  <button className='w-12 h-12 bg-blue-400 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'>
                    <RiCodeLine className='w-6 h-6' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <div className='space-y-8'>
            <div>
              <h3
                className={`text-2xl font-bold ${designSystem.colors.secondary[900]} mb-4`}
              >
                Form Elementleri
              </h3>
              <p className={`${designSystem.colors.secondary[600]} mb-6`}>
                Projedeki farklı sayfalardan çıkarılan form tasarım örnekleri
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-8'>
              {/* Contact Form */}
              <div className={`${designSystem.components.card.base} p-8`}>
                <h4 className='text-xl font-bold text-gray-900 mb-6'>
                  İletişim Formu
                </h4>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Firma Adı <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                      placeholder='Şirket adınızı giriniz'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      E-posta <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='email'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                      placeholder='ornek@sirket.com'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Sektör <span className='text-red-500'>*</span>
                    </label>
                    <select className='w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'>
                      <option value=''>Sektör seçiniz</option>
                      <option value='tekstil'>Tekstil ve Konfeksiyon</option>
                      <option value='gida'>Gıda ve İçecek</option>
                      <option value='teknoloji'>Teknoloji ve Yazılım</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Açıklama
                    </label>
                    <textarea
                      maxLength={500}
                      rows={4}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none'
                      placeholder='Programdan beklentilerinizi ve sorularınızı yazabilirsiniz...'
                    />
                    <div className='text-right text-sm text-gray-500 mt-1'>
                      0/500
                    </div>
                  </div>
                  <button className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center'>
                    <RiStarLine className='mr-3 w-5 h-5' />
                    Başvuruyu Gönder
                  </button>
                </div>
              </div>

              {/* Search & Filter Forms */}
              <div className={`${designSystem.components.card.base} p-8`}>
                <h4 className='text-xl font-bold text-gray-900 mb-6'>
                  Arama ve Filtre
                </h4>
                <div className='space-y-4'>
                  <div className='relative'>
                    <RiEyeLine className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <input
                      type='text'
                      placeholder='Firma, şehir veya sektör ara...'
                      className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm'
                    />
                  </div>
                  <div className='relative'>
                    <RiEyeLine className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <input
                      type='text'
                      placeholder='Soru ara...'
                      className='w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm'
                    />
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <button className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap bg-blue-600 text-white shadow-lg'>
                      Tümü
                    </button>
                    <button className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200'>
                      Genel Bilgiler
                    </button>
                    <button className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200'>
                      Başvuru
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className={`${designSystem.components.card.base} p-6 text-center`}>
        <p className={`text-sm ${designSystem.colors.secondary[600]}`}>
          Bu sayfa projedeki tüm tasarım elementlerini test etmek için
          oluşturulmuştur. Değişiklik yapmak istediğiniz alanları buradan
          görebilir ve test edebilirsiniz.
        </p>
        <div className='flex justify-center gap-4 mt-4'>
          <button
            className={`${designSystem.components.button.base} ${designSystem.components.button.outline}`}
            onClick={() => window.location.reload()}
          >
            <RiRefreshLine className='w-4 h-4 mr-2' />
            Sayfayı Yenile
          </button>
          <button
            className={`${designSystem.components.button.base} ${designSystem.components.button.primary}`}
            onClick={() => window.print()}
          >
            <RiDownloadLine className='w-4 h-4 mr-2' />
            PDF Olarak Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
