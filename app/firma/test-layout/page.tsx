import FirmaLayout from '@/components/firma/FirmaLayout';
export default function TestLayoutPage() {
  return (
    <FirmaLayout
      title='Layout Test Sayfası'
      description="FirmaLayout component'ini test etmek için oluşturulmuş sayfa"
    >
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-base font-semibold text-gray-900 mb-4'>
          🚀 Auto-Collapse Sidebar Test
        </h2>
        <p className='text-sm text-gray-600 mb-4'>
          Bu sayfa FirmaLayout component&apos;ini test etmek için
          oluşturulmuştur.
        </p>
        <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
          <h3 className='text-base font-semibold text-blue-800 mb-2'>
            🎯 Auto-Collapse Özelliği Test Ediliyor
          </h3>
          <ul className='text-sm text-blue-700 space-y-1'>
            <li>• Sidebar 5 saniye sonra otomatik daralacak</li>
            <li>• Mouse sidebar üzerindeyken timer durur</li>
            <li>• Manuel toggle timer&apos;ı sıfırlar</li>
            <li>• Sadece desktop&apos;ta çalışır</li>
            <li>
              • <strong>YENİ:</strong> Hover ile sidebar açma
            </li>
            <li>
              • <strong>YENİ:</strong> Sabit header (scroll etmez)
            </li>
          </ul>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='bg-blue-50 p-4 rounded-lg'>
            <h3 className='font-medium text-blue-900 text-sm'>✅ Özellik 1</h3>
            <p className='text-blue-700 text-xs'>MinimalHeader entegrasyonu</p>
          </div>
          <div className='bg-green-50 p-4 rounded-lg'>
            <h3 className='font-medium text-green-900 text-sm'>✅ Özellik 2</h3>
            <p className='text-green-700 text-xs'>
              AnimatedSidebar entegrasyonu
            </p>
          </div>
          <div className='bg-orange-50 p-4 rounded-lg'>
            <h3 className='font-medium text-orange-900 text-sm'>
              🆕 Özellik 3
            </h3>
            <p className='text-orange-700 text-xs'>
              Auto-collapse timer + Visual feedback
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
          <div className='bg-green-50 p-4 rounded-lg'>
            <h3 className='font-medium text-green-900 text-sm'>
              🎨 YENİ: Hover Effects
            </h3>
            <p className='text-green-700 text-xs'>
              Hover ile sidebar açma ve smooth transitions
            </p>
          </div>
          <div className='bg-purple-50 p-4 rounded-lg'>
            <h3 className='font-medium text-purple-900 text-sm'>
              ⚡ YENİ: Fixed Layout
            </h3>
            <p className='text-purple-700 text-xs'>
              Sabit header ve tutarlı tasarım
            </p>
          </div>
        </div>
        <div className='mt-6 p-4 bg-gray-100 rounded-md'>
          <p className='text-sm text-gray-600'>
            <strong>Test Adımları:</strong>
            <br />
            1. Sidebar&apos;ın açık olduğunu kontrol edin
            <br />
            2. 5 saniye bekleyin - sidebar otomatik daralmalı
            <br />
            3. Sidebar&apos;a mouse ile hover yapın - timer durmalı
            <br />
            4. Mouse&apos;u çekin - timer yeniden başlamalı
            <br />
            5. Hamburger menüye tıklayın - timer sıfırlanmalı
            <br />
            6. Daraltılmış sidebar&apos;a hover yapın - otomatik açılmalı
            <br />
            7. Header&apos;ın scroll ile kaybolmadığını kontrol edin
          </p>
        </div>
      </div>
    </FirmaLayout>
  );
}
