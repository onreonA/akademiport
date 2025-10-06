'use client';
import {
  BookOpen,
  Users,
  Building,
  User,
  Settings,
  Calendar,
  MessageSquare,
  Newspaper,
  UserCheck,
  ClipboardList,
  BarChart3,
  Home,
  Video,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
interface PageTitleProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}
const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  icon,
  className = '',
}) => {
  const pathname = usePathname();
  // Eğer title verilmemişse, pathname'den otomatik oluştur
  const pageTitle = title || generateTitleFromPath(pathname);
  const pageSubtitle = subtitle || generateSubtitleFromPath(pathname);
  const pageIcon = icon || generateIconFromPath(pathname);
  // Browser tab başlığını güncelle
  useEffect(() => {
    const fullTitle = `${pageTitle} - İhracat Akademi`;
    document.title = fullTitle;
  }, [pageTitle]);
  return (
    <div className={`mb-6 ${className}`}>
      <div className='flex items-center space-x-3'>
        {/* Icon */}
        <div className='flex-shrink-0'>
          <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
            <div className='text-blue-600'>{pageIcon}</div>
          </div>
        </div>
        {/* Title and Subtitle */}
        <div className='flex-1 min-w-0'>
          <h1 className='text-2xl font-bold text-gray-900 truncate'>
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className='text-sm text-gray-500 mt-1'>{pageSubtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
// Pathname'den başlık oluştur
function generateTitleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  // /firma segmentini atla
  if (segments[0] === 'firma') {
    segments.shift();
  }
  if (segments.length === 0) {
    return 'Ana Sayfa';
  }
  const lastSegment = segments[segments.length - 1];
  return translateSegment(lastSegment);
}
// Pathname'den alt başlık oluştur
function generateSubtitleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  // /firma segmentini atla
  if (segments[0] === 'firma') {
    segments.shift();
  }
  if (segments.length === 0) {
    return 'Firma yönetim merkezi';
  }
  if (segments.length === 1) {
    return getSubtitleForPage(segments[0]);
  }
  return getSubtitleForPage(segments[0], segments[1]);
}
// Pathname'den icon oluştur
function generateIconFromPath(pathname: string): React.ReactNode {
  const segments = pathname.split('/').filter(Boolean);
  // /firma segmentini atla
  if (segments[0] === 'firma') {
    segments.shift();
  }
  if (segments.length === 0) {
    return <Home size={20} />;
  }
  const mainSegment = segments[0];
  return getIconForPage(mainSegment);
}
// URL segmentlerini Türkçe'ye çevir
function translateSegment(segment: string): string {
  const translations: { [key: string]: string } = {
    egitimlerim: 'Eğitimlerim',
    videolar: 'Videolar',
    dokumanlar: 'Dökümanlar',
    ilerleme: 'İlerleme',
    'proje-yonetimi': 'Proje Yönetimi',
    etkinlikler: 'Etkinlikler',
    randevularim: 'Randevularım',
    haberler: 'Haberler',
    forum: 'Forum',
    'ik-havuzu': 'İK Havuzu',
    'raporlama-analiz': 'Raporlarım',
    'firma-yonetimi': 'Firma Yönetimi',
    'kullanici-yonetimi': 'Kullanıcı Yönetimi',
    profil: 'Profil',
    ayarlar: 'Ayarlar',
    detaylar: 'Detaylar',
    'yeni-konu': 'Yeni Konu',
    'konu-detaylari': 'Konu Detayları',
  };
  return (
    translations[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}
// Sayfa için alt başlık al
function getSubtitleForPage(mainPage: string, subPage?: string): string {
  const subtitles: { [key: string]: string } = {
    egitimlerim: 'Eğitim içeriklerinizi yönetin ve takip edin',
    videolar: 'Video eğitimlerinizi izleyin',
    dokumanlar: 'Eğitim dokümanlarınızı inceleyin',
    ilerleme: 'Eğitim ilerlemenizi takip edin',
    'proje-yonetimi': 'Projelerinizi yönetin ve organize edin',
    etkinlikler: 'Etkinliklerinizi görüntüleyin ve yönetin',
    randevularim: 'Randevularınızı planlayın ve takip edin',
    haberler: 'Güncel haberleri ve duyuruları takip edin',
    forum: 'Topluluk forumunda tartışmalara katılın',
    'ik-havuzu': 'İnsan kaynakları havuzunuzu yönetin',
    'raporlama-analiz': 'Raporlarınızı görüntüleyin ve analiz edin',
    'firma-yonetimi': 'Firma bilgilerinizi yönetin',
    'kullanici-yonetimi': 'Kullanıcılarınızı yönetin',
    profil: 'Profil bilgilerinizi düzenleyin',
    ayarlar: 'Sistem ayarlarınızı yapılandırın',
  };
  if (subPage) {
    return subtitles[subPage] || subtitles[mainPage] || 'Sayfa yönetimi';
  }
  return subtitles[mainPage] || 'Sayfa yönetimi';
}
// Sayfa için icon al
function getIconForPage(page: string): React.ReactNode {
  const icons: { [key: string]: React.ReactNode } = {
    egitimlerim: <BookOpen size={20} />,
    videolar: <Video size={20} />,
    dokumanlar: <FileText size={20} />,
    ilerleme: <TrendingUp size={20} />,
    'proje-yonetimi': <BarChart3 size={20} />,
    etkinlikler: <Calendar size={20} />,
    randevularim: <ClipboardList size={20} />,
    haberler: <Newspaper size={20} />,
    forum: <MessageSquare size={20} />,
    'ik-havuzu': <UserCheck size={20} />,
    'raporlama-analiz': <BarChart3 size={20} />,
    'firma-yonetimi': <Building size={20} />,
    'kullanici-yonetimi': <Users size={20} />,
    profil: <User size={20} />,
    ayarlar: <Settings size={20} />,
  };
  return icons[page] || <Home size={20} />;
}
export default PageTitle;
