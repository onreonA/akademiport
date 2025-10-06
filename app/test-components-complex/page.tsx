'use client';
import { useState } from 'react';

// Import all available components
import AdminLayout from '@/components/admin/AdminLayout';
import FirmaHeader from '@/components/firma/FirmaHeader';
import AnimatedSidebar from '@/components/layout/AnimatedSidebar';
import MinimalHeader from '@/components/layout/MinimalHeader';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  LazyExportImport,
  LazyFileManager,
  LazyGlobalSearch,
} from '@/lib/utils/lazy-imports';
export default function TestComponentsPage() {
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();
  const components = [
    // Layout Components
    { id: 'animated-sidebar', name: 'Animated Sidebar', category: 'Layout' },
    { id: 'minimal-header', name: 'Minimal Header', category: 'Layout' },
    { id: 'firma-header', name: 'Firma Header', category: 'Layout' },
    { id: 'admin-layout', name: 'Admin Layout', category: 'Layout' },
    // UI Components
    { id: 'buttons', name: 'Buttons & Actions', category: 'UI' },
    { id: 'cards', name: 'Cards & Containers', category: 'UI' },
    { id: 'forms', name: 'Forms & Inputs', category: 'UI' },
    { id: 'tables', name: 'Tables & Data', category: 'UI' },
    { id: 'modals', name: 'Modals & Dialogs', category: 'UI' },
    { id: 'navigation', name: 'Navigation', category: 'UI' },
    // Feature Components
    { id: 'file-manager', name: 'File Manager', category: 'Features' },
    { id: 'export-import', name: 'Export/Import', category: 'Features' },
    { id: 'global-search', name: 'Global Search', category: 'Features' },
    { id: 'data-table', name: 'Optimized Data Table', category: 'Features' },
    // Dashboard Components
    { id: 'stats-cards', name: 'Stats Cards', category: 'Dashboard' },
    { id: 'charts', name: 'Charts & Graphs', category: 'Dashboard' },
    { id: 'activity-feed', name: 'Activity Feed', category: 'Dashboard' },
    { id: 'notifications', name: 'Notifications', category: 'Dashboard' },
  ];
  const categories = [...new Set(components.map(c => c.category))];
  const renderComponent = () => {
    switch (selectedComponent) {
      case 'animated-sidebar':
        return (
          <div className='h-96 border rounded-lg overflow-hidden'>
            <AnimatedSidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        );
      case 'minimal-header':
        return (
          <div className='border rounded-lg overflow-hidden'>
            <MinimalHeader onSidebarToggle={() => {}} />
          </div>
        );
      case 'firma-header':
        return (
          <div className='border rounded-lg overflow-hidden'>
            <FirmaHeader />
          </div>
        );
      case 'admin-layout':
        return (
          <div className='h-96 border rounded-lg overflow-hidden'>
            <AdminLayout title='Test Components'>
              <div className='p-6'>
                <h2 className='text-xl font-semibold'>Admin Layout Test</h2>
                <p className='text-gray-600'>Bu admin layout içeriği</p>
              </div>
            </AdminLayout>
          </div>
        );
      case 'buttons':
        return (
          <div className='space-y-4'>
            <div className='flex flex-wrap gap-3'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                Primary Button
              </button>
              <button className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                Secondary Button
              </button>
              <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                Success Button
              </button>
              <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                Danger Button
              </button>
              <button className='bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                Warning Button
              </button>
            </div>
            <div className='flex flex-wrap gap-3'>
              <button className='border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors'>
                Outline Primary
              </button>
              <button className='border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors'>
                Outline Secondary
              </button>
              <button className='text-blue-600 hover:text-blue-700 px-4 py-2 font-medium transition-colors'>
                Text Button
              </button>
            </div>
            <div className='flex flex-wrap gap-3'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center'>
                <i className='ri-add-line mr-2'></i>
                Icon Button
              </button>
              <button className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center'>
                <i className='ri-download-line mr-2'></i>
                Download
              </button>
              <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center'>
                <i className='ri-save-line mr-2'></i>
                Save
              </button>
            </div>
          </div>
        );
      case 'cards':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Basic Card */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Basic Card
              </h3>
              <p className='text-gray-600 text-sm'>Bu basit bir kart örneği</p>
            </div>
            {/* Stats Card */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Toplam Proje
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>24</p>
                </div>
                <div className='p-3 bg-blue-100 rounded-lg'>
                  <i className='ri-folder-line text-blue-600 text-xl'></i>
                </div>
              </div>
              <div className='mt-4'>
                <span className='text-sm text-green-600 font-medium'>+12%</span>
                <span className='text-sm text-gray-600 ml-2'>
                  geçen aya göre
                </span>
              </div>
            </div>
            {/* Action Card */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Action Card
              </h3>
              <p className='text-gray-600 text-sm mb-4'>
                Bu kartta aksiyon butonları var
              </p>
              <div className='flex gap-2'>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors'>
                  Düzenle
                </button>
                <button className='border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 rounded text-sm font-medium transition-colors'>
                  Görüntüle
                </button>
              </div>
            </div>
            {/* Gradient Card */}
            <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Gradient Card</h3>
              <p className='text-blue-100 text-sm'>Gradient arka planlı kart</p>
            </div>
            {/* Icon Card */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center mb-4'>
                <div className='p-2 bg-green-100 rounded-lg mr-3'>
                  <i className='ri-check-line text-green-600 text-lg'></i>
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Icon Card
                </h3>
              </div>
              <p className='text-gray-600 text-sm'>İkon ile birlikte kart</p>
            </div>
            {/* Loading Card */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
                <div className='h-8 bg-gray-200 rounded w-1/3'></div>
              </div>
            </div>
          </div>
        );
      case 'forms':
        return (
          <div className='max-w-2xl space-y-6'>
            {/* Basic Form */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Form Elements
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Text Input
                  </label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    placeholder='Metin giriniz'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email Input
                  </label>
                  <input
                    type='email'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    placeholder='email@example.com'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Select
                  </label>
                  <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'>
                    <option>Seçenek 1</option>
                    <option>Seçenek 2</option>
                    <option>Seçenek 3</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Textarea
                  </label>
                  <textarea
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    placeholder='Açıklama yazınız'
                  />
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='checkbox1'
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label
                    htmlFor='checkbox1'
                    className='ml-2 text-sm text-gray-700'
                  >
                    Checkbox seçeneği
                  </label>
                </div>
                <div className='flex items-center space-x-4'>
                  <input
                    type='radio'
                    id='radio1'
                    name='radio'
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                  />
                  <label htmlFor='radio1' className='text-sm text-gray-700'>
                    Radio seçenek 1
                  </label>
                  <input
                    type='radio'
                    id='radio2'
                    name='radio'
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                  />
                  <label htmlFor='radio2' className='text-sm text-gray-700'>
                    Radio seçenek 2
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 'tables':
        return (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Data Table
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  <tr className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      John Doe
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      john@example.com
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      Admin
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                        Active
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button className='text-blue-600 hover:text-blue-900 mr-3'>
                        Edit
                      </button>
                      <button className='text-red-600 hover:text-red-900'>
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      Jane Smith
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      jane@example.com
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      User
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                        Pending
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button className='text-blue-600 hover:text-blue-900 mr-3'>
                        Edit
                      </button>
                      <button className='text-red-600 hover:text-red-900'>
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'modals':
        return (
          <div className='space-y-4'>
            <button
              onClick={() => {
                /* Modal açma logic */
              }}
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
            >
              Modal Aç
            </button>
            {/* Modal Example */}
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
              <div className='bg-white rounded-xl shadow-xl max-w-md w-full'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Modal Başlık
                  </h3>
                </div>
                <div className='px-6 py-4'>
                  <p className='text-gray-600'>Bu bir modal örneği</p>
                </div>
                <div className='px-6 py-4 border-t border-gray-200 flex justify-end space-x-3'>
                  <button className='border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors'>
                    İptal
                  </button>
                  <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                    Onayla
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'navigation':
        return (
          <div className='space-y-6'>
            {/* Breadcrumb */}
            <nav className='flex' aria-label='Breadcrumb'>
              <ol className='flex items-center space-x-2'>
                <li>
                  <a href='#' className='text-gray-500 hover:text-gray-700'>
                    <i className='ri-home-line'></i>
                  </a>
                </li>
                <li>
                  <i className='ri-arrow-right-s-line text-gray-400'></i>
                </li>
                <li>
                  <a href='#' className='text-gray-500 hover:text-gray-700'>
                    Admin
                  </a>
                </li>
                <li>
                  <i className='ri-arrow-right-s-line text-gray-400'></i>
                </li>
                <li>
                  <span className='text-gray-900 font-medium'>Dashboard</span>
                </li>
              </ol>
            </nav>
            {/* Tabs */}
            <div className='border-b border-gray-200'>
              <nav className='-mb-px flex space-x-8'>
                <a
                  href='#'
                  className='border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                >
                  Aktif Tab
                </a>
                <a
                  href='#'
                  className='border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                >
                  Pasif Tab
                </a>
                <a
                  href='#'
                  className='border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                >
                  Başka Tab
                </a>
              </nav>
            </div>
            {/* Pagination */}
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-700'>
                <span>1-10 arası, toplam 100 kayıt</span>
              </div>
              <div className='flex space-x-1'>
                <button className='px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50'>
                  Önceki
                </button>
                <button className='px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium'>
                  1
                </button>
                <button className='px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50'>
                  2
                </button>
                <button className='px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50'>
                  3
                </button>
                <button className='px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50'>
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        );
      case 'file-manager':
        return (
          <div className='border rounded-lg p-4'>
            <LazyFileManager />
          </div>
        );
      case 'export-import':
        return (
          <div className='border rounded-lg p-4'>
            <LazyExportImport type={'test' as any} />
          </div>
        );
      case 'global-search':
        return (
          <div className='border rounded-lg p-4'>
            <LazyGlobalSearch placeholder='Test arama...' />
          </div>
        );
      case 'data-table':
        return (
          <div className='border rounded-lg p-4'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Data Table Preview
                </h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ID
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    <tr className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        1
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        Test 1
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        2
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        Test 2
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                          Pending
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'stats-cards':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                title: 'Toplam Proje',
                value: '24',
                change: '+12%',
                icon: 'ri-folder-line',
                color: 'blue',
              },
              {
                title: 'Aktif Kullanıcı',
                value: '156',
                change: '+8%',
                icon: 'ri-user-line',
                color: 'green',
              },
              {
                title: 'Tamamlanan',
                value: '89',
                change: '+15%',
                icon: 'ri-check-line',
                color: 'purple',
              },
              {
                title: 'Bekleyen',
                value: '12',
                change: '-3%',
                icon: 'ri-time-line',
                color: 'yellow',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      {stat.title}
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <i
                      className={`${stat.icon} text-${stat.color}-600 text-xl`}
                    ></i>
                  </div>
                </div>
                <div className='mt-4'>
                  <span
                    className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} font-medium`}
                  >
                    {stat.change}
                  </span>
                  <span className='text-sm text-gray-600 ml-2'>
                    geçen aya göre
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      case 'charts':
        return (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Bar Chart
              </h3>
              <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
                <p className='text-gray-500'>Chart component buraya gelecek</p>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Line Chart
              </h3>
              <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
                <p className='text-gray-500'>Chart component buraya gelecek</p>
              </div>
            </div>
          </div>
        );
      case 'activity-feed':
        return (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Activity Feed
            </h3>
            <div className='space-y-4'>
              {[
                {
                  action: 'Yeni proje oluşturuldu',
                  user: 'John Doe',
                  time: '2 saat önce',
                  icon: 'ri-add-line',
                  color: 'green',
                },
                {
                  action: 'Dosya yüklendi',
                  user: 'Jane Smith',
                  time: '4 saat önce',
                  icon: 'ri-upload-line',
                  color: 'blue',
                },
                {
                  action: 'Görev tamamlandı',
                  user: 'Mike Johnson',
                  time: '6 saat önce',
                  icon: 'ri-check-line',
                  color: 'purple',
                },
                {
                  action: 'Yorum eklendi',
                  user: 'Sarah Wilson',
                  time: '8 saat önce',
                  icon: 'ri-message-line',
                  color: 'yellow',
                },
              ].map((activity, index) => (
                <div key={index} className='flex items-start space-x-3'>
                  <div className={`p-2 bg-${activity.color}-100 rounded-lg`}>
                    <i
                      className={`${activity.icon} text-${activity.color}-600`}
                    ></i>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {activity.action}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className='space-y-4'>
            {/* Success Notification */}
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <i className='ri-check-line text-green-400'></i>
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-green-800'>
                    Başarılı!
                  </p>
                  <p className='text-sm text-green-700'>
                    İşlem başarıyla tamamlandı.
                  </p>
                </div>
              </div>
            </div>
            {/* Error Notification */}
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <i className='ri-error-warning-line text-red-400'></i>
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-red-800'>Hata!</p>
                  <p className='text-sm text-red-700'>
                    Bir hata oluştu, lütfen tekrar deneyin.
                  </p>
                </div>
              </div>
            </div>
            {/* Warning Notification */}
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <i className='ri-alert-line text-yellow-400'></i>
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-yellow-800'>Uyarı!</p>
                  <p className='text-sm text-yellow-700'>
                    Bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
            </div>
            {/* Info Notification */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <i className='ri-information-line text-blue-400'></i>
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-blue-800'>Bilgi</p>
                  <p className='text-sm text-blue-700'>
                    Yeni özellikler eklendi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className='text-center py-12'>
            <i className='ri-palette-line text-6xl text-gray-300 mb-4'></i>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Component Seçin
            </h3>
            <p className='text-gray-600'>
              Yukarıdan bir component seçerek önizlemesini görebilirsiniz.
            </p>
          </div>
        );
    }
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Component Test Sayfası
          </h1>
          <p className='text-gray-600'>
            Tüm mevcut bileşenleri test edin ve tasarım standartlarını
            belirleyin
          </p>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Components
              </h2>
              {categories.map(category => (
                <div key={category} className='mb-6'>
                  <h3 className='text-sm font-medium text-gray-500 uppercase tracking-wider mb-3'>
                    {category}
                  </h3>
                  <div className='space-y-1'>
                    {components
                      .filter(c => c.category === category)
                      .map(component => (
                        <button
                          key={component.id}
                          onClick={() => setSelectedComponent(component.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedComponent === component.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {component.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Main Content */}
          <div className='lg:col-span-3'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='mb-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  {selectedComponent
                    ? components.find(c => c.id === selectedComponent)?.name
                    : 'Component Preview'}
                </h2>
                {selectedComponent && (
                  <p className='text-sm text-gray-600 mt-1'>
                    {components.find(c => c.id === selectedComponent)?.category}{' '}
                    • {selectedComponent}
                  </p>
                )}
              </div>
              <div className='min-h-96'>{renderComponent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
