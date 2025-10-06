'use client';
import { useState } from 'react';
export default function TestComponentsPage() {
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const components = [
    // UI Components
    { id: 'buttons', name: 'Buttons & Actions', category: 'UI' },
    { id: 'cards', name: 'Cards & Containers', category: 'UI' },
    { id: 'forms', name: 'Forms & Inputs', category: 'UI' },
    { id: 'tables', name: 'Tables & Data', category: 'UI' },
    { id: 'modals', name: 'Modals & Dialogs', category: 'UI' },
    { id: 'navigation', name: 'Navigation', category: 'UI' },
    // Dashboard Components
    { id: 'stats-cards', name: 'Stats Cards', category: 'Dashboard' },
    { id: 'charts', name: 'Charts & Graphs', category: 'Dashboard' },
    { id: 'calendar', name: 'Calendar', category: 'Dashboard' },
    { id: 'activity-feed', name: 'Activity Feed', category: 'Dashboard' },
    // Advanced Components
    { id: 'gradient-designs', name: 'Gradient Designs', category: 'Advanced' },
    { id: 'glassmorphism', name: 'Glassmorphism', category: 'Advanced' },
    { id: 'color-palettes', name: 'Color Palettes', category: 'Advanced' },
    { id: 'typography', name: 'Typography', category: 'Advanced' },
  ];
  const categories = [...new Set(components.map(c => c.category))];
  const renderComponent = () => {
    switch (selectedComponent) {
      case 'buttons':
        return (
          <div className='space-y-6'>
            {/* Basic Buttons */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Basic Buttons</h3>
              <div className='flex flex-wrap gap-3'>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Primary
                </button>
                <button className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Secondary
                </button>
                <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Success
                </button>
                <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Danger
                </button>
                <button className='bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Warning
                </button>
                <button className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Purple
                </button>
              </div>
            </div>
            {/* Outline Buttons */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Outline Buttons</h3>
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
            </div>
            {/* Icon Buttons */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Icon Buttons</h3>
              <div className='flex flex-wrap gap-3'>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center'>
                  <i className='ri-add-line mr-2'></i>
                  Add Item
                </button>
                <button className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center'>
                  <i className='ri-download-line mr-2'></i>
                  Download
                </button>
                <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center'>
                  <i className='ri-save-line mr-2'></i>
                  Save
                </button>
                <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center'>
                  <i className='ri-delete-bin-line mr-2'></i>
                  Delete
                </button>
              </div>
            </div>
            {/* Button Sizes */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Button Sizes</h3>
              <div className='flex flex-wrap items-center gap-3'>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors'>
                  Small
                </button>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Medium
                </button>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors'>
                  Large
                </button>
              </div>
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
                  <tr className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      Mike Johnson
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      mike@example.com
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      Manager
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                        Online
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
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
              Modal Aç (Basit Versiyon)
            </button>
            {/* Simple Modal Example */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Modal Örneği
              </h3>
              <p className='text-gray-600 mb-4'>
                Bu basit bir modal örneği. Gerçek modal için Headless UI
                kullanılabilir.
              </p>
              <div className='flex gap-3'>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Onayla
                </button>
                <button className='border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors'>
                  İptal
                </button>
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
                <p className='text-gray-500'>
                  Chart.js component buraya gelecek
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Line Chart
              </h3>
              <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
                <p className='text-gray-500'>
                  Recharts component buraya gelecek
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Pie Chart
              </h3>
              <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
                <p className='text-gray-500'>Doughnut chart buraya gelecek</p>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Area Chart
              </h3>
              <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
                <p className='text-gray-500'>Area chart buraya gelecek</p>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Calendar
            </h3>
            <div className='h-96 bg-gray-100 rounded-lg flex items-center justify-center'>
              <p className='text-gray-500'>
                FullCalendar component buraya gelecek
              </p>
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
                {
                  action: 'Randevu planlandı',
                  user: 'Alex Brown',
                  time: '10 saat önce',
                  icon: 'ri-calendar-line',
                  color: 'red',
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
      case 'gradient-designs':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Gradient Cards */}
            <div className='bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-xl p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Purple to Red</h3>
              <p className='text-purple-100'>Beautiful gradient design</p>
            </div>
            <div className='bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Blue to Pink</h3>
              <p className='text-blue-100'>Modern gradient card</p>
            </div>
            <div className='bg-gradient-to-br from-green-400 to-blue-500 rounded-xl p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Green to Blue</h3>
              <p className='text-green-100'>Nature inspired gradient</p>
            </div>
            <div className='bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 rounded-xl p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Sunset Gradient</h3>
              <p className='text-yellow-100'>Warm sunset colors</p>
            </div>
            <div className='bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Indigo to Pink</h3>
              <p className='text-indigo-100'>Professional gradient</p>
            </div>
            <div className='bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Teal to Blue</h3>
              <p className='text-teal-100'>Ocean inspired gradient</p>
            </div>
          </div>
        );
      case 'glassmorphism':
        return (
          <div className='relative min-h-96 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl p-8'>
            <div className='backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-6 text-white'>
              <h3 className='text-lg font-semibold mb-2'>Glassmorphism Card</h3>
              <p className='text-white/90'>
                Modern glass effect with backdrop blur
              </p>
            </div>
            <div className='mt-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4 text-white'>
              <h4 className='font-medium mb-2'>Secondary Glass Card</h4>
              <p className='text-white/80 text-sm'>Subtle glass effect</p>
            </div>
            <div className='mt-4 backdrop-blur-lg bg-white/30 border border-white/40 rounded-xl p-4 text-white'>
              <h4 className='font-medium mb-2'>Strong Glass Effect</h4>
              <p className='text-white/90 text-sm'>
                More pronounced glass effect
              </p>
            </div>
          </div>
        );
      case 'color-palettes':
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold mb-4'>Color Palettes</h3>
            {/* Primary Colors */}
            <div>
              <h4 className='text-md font-medium mb-3'>Primary Colors</h4>
              <div className='flex gap-2'>
                <div className='w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  Blue
                </div>
                <div className='w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  Green
                </div>
                <div className='w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  Purple
                </div>
                <div className='w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  Red
                </div>
                <div className='w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  Yellow
                </div>
              </div>
            </div>
            {/* Neutral Colors */}
            <div>
              <h4 className='text-md font-medium mb-3'>Neutral Colors</h4>
              <div className='flex gap-2'>
                <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-800 text-xs font-medium'>
                  100
                </div>
                <div className='w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center text-gray-800 text-xs font-medium'>
                  300
                </div>
                <div className='w-16 h-16 bg-gray-500 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  500
                </div>
                <div className='w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  700
                </div>
                <div className='w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-medium'>
                  900
                </div>
              </div>
            </div>
          </div>
        );
      case 'typography':
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold mb-4'>Typography</h3>
            {/* Headings */}
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                Heading 1 - 4xl Bold
              </h1>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                Heading 2 - 3xl Bold
              </h2>
              <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
                Heading 3 - 2xl Semibold
              </h3>
              <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                Heading 4 - xl Semibold
              </h4>
              <h5 className='text-lg font-medium text-gray-900 mb-2'>
                Heading 5 - lg Medium
              </h5>
              <h6 className='text-base font-medium text-gray-900 mb-2'>
                Heading 6 - base Medium
              </h6>
            </div>
            {/* Body Text */}
            <div>
              <p className='text-lg text-gray-700 mb-2'>Large body text - lg</p>
              <p className='text-base text-gray-700 mb-2'>
                Regular body text - base
              </p>
              <p className='text-sm text-gray-600 mb-2'>Small body text - sm</p>
              <p className='text-xs text-gray-500 mb-2'>
                Extra small text - xs
              </p>
            </div>
            {/* Font Weights */}
            <div>
              <p className='text-base font-thin text-gray-700 mb-1'>
                Thin - font-thin
              </p>
              <p className='text-base font-light text-gray-700 mb-1'>
                Light - font-light
              </p>
              <p className='text-base font-normal text-gray-700 mb-1'>
                Normal - font-normal
              </p>
              <p className='text-base font-medium text-gray-700 mb-1'>
                Medium - font-medium
              </p>
              <p className='text-base font-semibold text-gray-700 mb-1'>
                Semibold - font-semibold
              </p>
              <p className='text-base font-bold text-gray-700 mb-1'>
                Bold - font-bold
              </p>
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
            Modern UI tasarım stilleri ve component&apos;ler
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
