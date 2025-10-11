import {
  Database,
  SearchX,
  FolderX,
  FileX,
  CheckSquare,
  Users,
  Building2,
  Newspaper,
  Video,
  MessageSquare,
  Bell,
  Lock,
  ShieldAlert,
  Clock,
  Plus,
  Upload,
  Settings,
  Inbox,
  type LucideIcon,
} from 'lucide-react';

export type ColorTheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface EmptyStateConfig {
  icon: LucideIcon;
  color: ColorTheme;
  title: string;
  description: string;
  defaultActionText?: string;
  showAction?: boolean;
  helpText?: string[];
}

export type EmptyStateType = 
  // Data States
  | 'no-data'
  | 'no-results'
  | 'no-items'
  // Entity States
  | 'no-projects'
  | 'no-sub-projects'
  | 'no-tasks'
  | 'no-users'
  | 'no-companies'
  | 'no-applications'
  | 'no-news'
  | 'no-documents'
  | 'no-videos'
  | 'no-messages'
  | 'no-notifications'
  | 'no-assignments'
  // State States
  | 'locked'
  | 'locked-projects'
  | 'unauthorized'
  | 'coming-soon'
  | 'maintenance'
  // Action States
  | 'create-first'
  | 'import-data'
  | 'setup-required'
  | 'empty-inbox';

export const emptyStateConfigs: Record<EmptyStateType, EmptyStateConfig> = {
  // Data States
  'no-data': {
    icon: Database,
    color: 'secondary',
    title: 'Veri Bulunamadı',
    description: 'Henüz veri bulunmuyor.',
    showAction: false,
  },
  'no-results': {
    icon: SearchX,
    color: 'warning',
    title: 'Sonuç Bulunamadı',
    description: 'Arama kriterlerinize uygun sonuç yok. Farklı anahtar kelimeler deneyin.',
    defaultActionText: 'Filtreleri Temizle',
    showAction: true,
  },
  'no-items': {
    icon: Inbox,
    color: 'secondary',
    title: 'Liste Boş',
    description: 'Henüz hiçbir öğe eklenmemiş.',
    showAction: false,
  },

  // Entity States
  'no-projects': {
    icon: FolderX,
    color: 'primary',
    title: 'Proje Atanmamış',
    description: 'Tarafınıza hiç proje atanmamıştır. Danışmanınızla iletişime geçiniz.',
    defaultActionText: 'Danışmanla İletişim',
    showAction: true,
    helpText: [
      'Danışmanınızla iletişime geçin',
      'Proje atama talebinde bulunun',
      'Sistem yöneticisine başvurun',
    ],
  },
  'no-sub-projects': {
    icon: FileX,
    color: 'success',
    title: 'Alt Proje Bulunamadı',
    description: 'Bu projede size atanmış alt proje bulunmamaktadır.',
    defaultActionText: 'Yenile',
    showAction: true,
  },
  'no-tasks': {
    icon: CheckSquare,
    color: 'info',
    title: 'Görev Bulunamadı',
    description: 'Bu alt projede görev bulunmamaktadır.',
    defaultActionText: 'Yenile',
    showAction: true,
  },
  'no-users': {
    icon: Users,
    color: 'primary',
    title: 'Kullanıcı Bulunamadı',
    description: 'Henüz kullanıcı eklenmemiş.',
    defaultActionText: 'Kullanıcı Ekle',
    showAction: true,
  },
  'no-companies': {
    icon: Building2,
    color: 'primary',
    title: 'Firma Bulunamadı',
    description: 'Henüz firma eklenmemiş.',
    defaultActionText: 'Firma Ekle',
    showAction: true,
  },
  'no-applications': {
    icon: FileX,
    color: 'secondary',
    title: 'Başvuru Bulunamadı',
    description: 'Henüz başvuru yapılmamış.',
    showAction: false,
  },
  'no-news': {
    icon: Newspaper,
    color: 'info',
    title: 'Haber Bulunamadı',
    description: 'Henüz haber yayınlanmamış.',
    defaultActionText: 'Yeni Haber Ekle',
    showAction: true,
  },
  'no-documents': {
    icon: FileX,
    color: 'secondary',
    title: 'Döküman Bulunamadı',
    description: 'Henüz döküman eklenmemiş.',
    defaultActionText: 'Döküman Ekle',
    showAction: true,
  },
  'no-videos': {
    icon: Video,
    color: 'error',
    title: 'Video Bulunamadı',
    description: 'Henüz video eklenmemiş.',
    defaultActionText: 'Video Ekle',
    showAction: true,
  },
  'no-messages': {
    icon: MessageSquare,
    color: 'primary',
    title: 'Mesaj Bulunamadı',
    description: 'Henüz mesaj gelmemiş.',
    showAction: false,
  },
  'no-notifications': {
    icon: Bell,
    color: 'secondary',
    title: 'Bildirim Yok',
    description: 'Henüz bildirim bulunmuyor.',
    showAction: false,
  },
  'no-assignments': {
    icon: Users,
    color: 'secondary',
    title: 'Atama Bulunamadı',
    description: 'Bu projeye henüz firma atanmamıştır.',
    defaultActionText: 'Firma Ata',
    showAction: true,
  },

  // State States
  'locked': {
    icon: Lock,
    color: 'warning',
    title: 'Kilitli İçerik',
    description: 'Bu içeriğe erişmek için yetkiniz yok.',
    showAction: false,
  },
  'locked-projects': {
    icon: Lock,
    color: 'warning',
    title: 'Kilitli Projeler',
    description: 'Size atanmış projeler kilitli durumda. Geçmiş işlemlerinizi görüntüleyebilirsiniz.',
    defaultActionText: 'Geçmiş Görüntüle',
    showAction: true,
    helpText: [
      'Proje yetkileriniz kaldırılmış',
      'Geçmiş işlemlerinizi görüntüleyebilirsiniz',
      'Yeni işlem yapamazsınız',
    ],
  },
  'unauthorized': {
    icon: ShieldAlert,
    color: 'error',
    title: 'Yetkisiz Erişim',
    description: 'Bu sayfaya erişmek için yeterli yetkiniz bulunmuyor.',
    defaultActionText: 'Ana Sayfaya Dön',
    showAction: true,
  },
  'coming-soon': {
    icon: Clock,
    color: 'info',
    title: 'Yakında',
    description: 'Bu özellik yakında eklenecek. Sabırlı olduğunuz için teşekkürler!',
    showAction: false,
  },
  'maintenance': {
    icon: Settings,
    color: 'warning',
    title: 'Bakım Modunda',
    description: 'Bu bölüm şu anda bakımdadır. Lütfen daha sonra tekrar deneyin.',
    showAction: false,
  },

  // Action States
  'create-first': {
    icon: Plus,
    color: 'primary',
    title: 'İlk Öğeyi Oluşturun',
    description: 'Başlamak için yeni bir öğe ekleyin.',
    defaultActionText: 'Yeni Oluştur',
    showAction: true,
  },
  'import-data': {
    icon: Upload,
    color: 'primary',
    title: 'Veri İçe Aktarın',
    description: 'CSV veya Excel dosyası yükleyerek toplu veri ekleyebilirsiniz.',
    defaultActionText: 'Dosya Yükle',
    showAction: true,
  },
  'setup-required': {
    icon: Settings,
    color: 'warning',
    title: 'Kurulum Gerekli',
    description: 'Bu özelliği kullanabilmek için önce kurulum yapmanız gerekmektedir.',
    defaultActionText: 'Kuruluma Başla',
    showAction: true,
  },
  'empty-inbox': {
    icon: Inbox,
    color: 'success',
    title: 'Tüm İşler Tamamlandı!',
    description: 'Harika! Bekleyen hiçbir işiniz yok.',
    showAction: false,
  },
};

