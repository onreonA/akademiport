'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import { LoadingEmptyState } from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { LazyExportImport } from '@/lib/utils/lazy-imports';
interface Company {
  id: string;
  name: string;
  subBrand?: string;
  authorizedPerson: string;
  sector: string;
  lastUpdate: string;
  projectStatus: 'Başlangıç' | 'Gelişim' | 'İleri' | 'Tamamlanmış';
  consultant: string;
  phone: string;
  email: string;
  city: string;
  registrationStatus: 'Tamamlanmadı' | 'İncelemede' | 'Tamamlandı';
  dysRecord: boolean;
  educationStatus: 'İzlenmeye Başlanmadı' | 'Devam Ediyor' | 'Tamamlandı';
  progressPercentage: number;
  notes?: string;
  website?: string;
  description?: string;
  address?: string;
}
const MenuItem = ({
  icon,
  title,
  isActive,
  onClick,
  hasSubMenu,
  isExpanded,
  href,
  sidebarCollapsed,
}: {
  icon: string;
  title: string;
  isActive?: boolean;
  onClick: () => void;
  hasSubMenu?: boolean;
  isExpanded?: boolean;
  href?: string;
  sidebarCollapsed?: boolean;
}) => {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-blue-100 text-blue-900 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
        <i className={`${icon} text-lg`}></i>
      </div>
      {!sidebarCollapsed && <span className='ml-3 truncate'>{title}</span>}
      {hasSubMenu && !sidebarCollapsed && (
        <div className='ml-auto w-4 h-4 flex items-center justify-center'>
          <i
            className={`ri-arrow-right-s-line text-sm transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          ></i>
        </div>
      )}
    </button>
  );
  if (href && !hasSubMenu) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};
const SubMenuItem = ({
  title,
  isActive,
  onClick,
  href,
}: {
  title: string;
  isActive?: boolean;
  onClick: () => void;
  href?: string;
}) => {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center pl-9 pr-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-800 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      <div className='w-2 h-2 bg-current rounded-full mr-3 opacity-60'></div>
      {title}
    </button>
  );
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};
const CompanyCard = ({
  company,
  onClick,
  onAssignConsultant,
  onViewNotes,
  onDeleteCompany,
  onEditCompany,
  onManagePassword,
  onGoToCompany,
}: {
  company: Company;
  onClick: () => void;
  onAssignConsultant: (companyId: string) => void;
  onViewNotes: (companyId: string) => void;
  onDeleteCompany: (companyId: string) => void;
  onEditCompany: (companyId: string) => void;
  onManagePassword: (companyId: string) => void;
  onGoToCompany: (companyId: string, companyName: string) => void;
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlanmadı':
        return 'bg-red-100 text-red-800';
      case 'İncelemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getEducationStatusColor = (status: string) => {
    switch (status) {
      case 'İzlenmeye Başlanmadı':
        return 'bg-gray-100 text-gray-800';
      case 'Devam Ediyor':
        return 'bg-blue-100 text-blue-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowActionsMenu(false);
  };
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer relative'>
      {/* Actions Menu */}
      <div className='absolute top-4 right-4'>
        <button
          onClick={e => {
            e.stopPropagation();
            setShowActionsMenu(!showActionsMenu);
          }}
          className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer'
        >
          <i className='ri-more-2-line text-gray-600'></i>
        </button>
        {showActionsMenu && (
          <div className='absolute right-0 top-10 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-10 min-w-48'>
            <button
              onClick={e => handleActionClick(e, onClick)}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-eye-line text-blue-600'></i>
              Firma Detayına Git
            </button>
            <button
              onClick={e =>
                handleActionClick(e, () =>
                  onGoToCompany(company.id, company.name)
                )
              }
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-external-link-line text-green-600'></i>
              Firmaya Git
            </button>
            <button
              onClick={e =>
                handleActionClick(e, () => onEditCompany(company.id))
              }
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-edit-line text-purple-600'></i>
              Firma Düzenle
            </button>
            <button
              onClick={e =>
                handleActionClick(e, () => onAssignConsultant(company.id))
              }
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-user-add-line text-green-600'></i>
              Danışman Ata / Değiştir
            </button>
            <button
              onClick={e => handleActionClick(e, () => onViewNotes(company.id))}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-sticky-note-line text-orange-600'></i>
              Firma Notları
            </button>
            <button
              onClick={e =>
                handleActionClick(e, () => onManagePassword(company.id))
              }
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-lock-line text-indigo-600'></i>
              Şifre Yönetimi
            </button>
            <button
              onClick={e =>
                handleActionClick(e, () => onDeleteCompany(company.id))
              }
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-delete-bin-line text-red-600'></i>
              Firma Sil
            </button>
          </div>
        )}
      </div>
      {/* Company Info */}
      <div onClick={onClick} className='pr-8'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            {company.name}
          </h3>
          {company.subBrand && (
            <p className='text-sm text-gray-600'>{company.subBrand}</p>
          )}
        </div>
        <div className='space-y-2 mb-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-user-star-line text-orange-500'></i>
            <span>{company.consultant}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-building-line text-green-500'></i>
            <span>{company.sector}</span>
          </div>
        </div>
        {/* Status Badges */}
        <div className='flex flex-wrap gap-2 mb-4'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.registrationStatus)}`}
          >
            {company.registrationStatus}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getEducationStatusColor(company.educationStatus)}`}
          >
            {company.educationStatus}
          </span>
          {company.dysRecord && (
            <span className='px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium'>
              DYS Kayıtlı
            </span>
          )}
        </div>
        {/* Progress Bar */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-600'>Genel İlerleme</span>
            <span className='text-sm font-medium'>
              {company.progressPercentage}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(company.progressPercentage)}`}
              style={{ width: `${company.progressPercentage}%` }}
            ></div>
          </div>
        </div>
        <div className='text-xs text-gray-500'>
          Son Güncelleme:{' '}
          {new Date(company.lastUpdate).toLocaleDateString('tr-TR')}
        </div>
      </div>
    </div>
  );
};
export default function CompanyManagement() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('company-management');
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [projeExpanded, setProjeExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const router = useRouter();
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [selectedRegistrationStatus, setSelectedRegistrationStatus] =
    useState('');
  const [selectedDysRecord, setSelectedDysRecord] = useState('');
  const [selectedEducationStatus, setSelectedEducationStatus] = useState('');
  // V1.8: Gelişmiş Arama Sistemi
  const [advancedSearch, setAdvancedSearch] = useState({
    companyName: '',
    authorizedPerson: '',
    sector: '',
    city: '',
    phone: '',
    email: '',
    website: '',
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favoriteFilters, setFavoriteFilters] = useState<
    Array<{
      id: string;
      name: string;
      filters: any;
    }>
  >([]);
  const [sortBy, setSortBy] = useState<
    'name' | 'created' | 'updated' | 'progress'
  >('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  // Fetch companies data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        setCompaniesError(null);
        const response = await fetch('/api/companies', {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        const data = await response.json();
        if (response.ok) {
          // Transform API data to match frontend expectations
          const transformedCompanies = (data.companies || []).map(
            (company: any) => ({
              ...company,
              sector: company.industry || 'Belirtilmemiş',
              authorizedPerson: 'Atanmamış', // Default value
              subBrand: company.description
                ? company.description.substring(0, 50) + '...'
                : 'Belirtilmemiş',
              consultant: 'Atanmamış', // Default value
              registrationStatus:
                company.status === 'active' ? 'Tamamlandı' : 'Tamamlanmadı',
              dysRecord: false, // Default value
              educationStatus: 'İzlenmeye Başlanmadı', // Default value
              progressPercentage: company.status === 'active' ? 75 : 25,
              lastUpdate: company.updated_at,
            })
          );
          setCompanies(transformedCompanies);
          setCompaniesError(null);
        } else {
          setCompaniesError(
            data.error || 'Firma verileri yüklenirken hata oluştu'
          );
        }
      } catch (error) {
        setCompaniesError('Firma verileri yüklenirken hata oluştu');
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);
  // V1.8: Load search history and favorite filters from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('companySearchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
      const savedFavorites = localStorage.getItem('companyFavoriteFilters');
      if (savedFavorites) {
        setFavoriteFilters(JSON.parse(savedFavorites));
      }
    } catch (error) {}
  }, []);
  // V1.8: Arama önerileri
  const generateSearchSuggestions = useCallback(
    (query: string) => {
      if (query.length < 2) {
        setSearchSuggestions([]);
        return;
      }
      const suggestions = new Set<string>();
      companies.forEach(company => {
        if (company.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(company.name);
        }
        if (
          company.authorizedPerson &&
          company.authorizedPerson.toLowerCase().includes(query.toLowerCase())
        ) {
          suggestions.add(company.authorizedPerson);
        }
        if (
          company.sector &&
          company.sector.toLowerCase().includes(query.toLowerCase())
        ) {
          suggestions.add(company.sector);
        }
        if (
          company.city &&
          company.city.toLowerCase().includes(query.toLowerCase())
        ) {
          suggestions.add(company.city);
        }
      });
      setSearchSuggestions(Array.from(suggestions).slice(0, 5));
    },
    [companies]
  );

  // V1.8: Generate search suggestions when search query changes
  useEffect(() => {
    generateSearchSuggestions(searchQuery);
  }, [searchQuery, generateSearchSuggestions]);
  const consultants = [...new Set(companies.map(c => c.consultant))];
  // Handler functions
  const handleGoToCompany = async (companyId: string, companyName: string) => {
    try {
      // Generate auto-login token for the company
      const response = await fetch('/api/auth/auto-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          companyId: companyId,
          companyName: companyName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Open new tab with auto-login URL
        const autoLoginUrl = `/firma?token=${data.token}&company=${encodeURIComponent(companyName)}`;

        // Test: First try to navigate in the same tab to see what happens
        window.location.href = autoLoginUrl; // Test navigation in same tab

        // Then open in new tab
        // const newTab = window.open(autoLoginUrl, '_blank');
      } else {
        console.error('❌ Auto-login token generation failed');
        alert('Otomatik giriş yapılamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('❌ Error generating auto-login:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  const handleAddCompany = () => {
    setShowAddModal(true);
  };
  const handleSaveCompany = async (formData: any) => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          description: formData.description,
          website: formData.website,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          sector: formData.sector,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh companies list
        const refreshResponse = await fetch('/api/companies', {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          // Transform API data to match frontend expectations
          const transformedCompanies = (refreshData.companies || []).map(
            (company: any) => ({
              ...company,
              sector: company.industry || 'Belirtilmemiş',
              authorizedPerson: 'Atanmamış', // Default value
              subBrand: company.description
                ? company.description.substring(0, 50) + '...'
                : 'Belirtilmemiş',
              consultant: 'Atanmamış', // Default value
              registrationStatus:
                company.status === 'active' ? 'Tamamlandı' : 'Tamamlanmadı',
              dysRecord: false, // Default value
              educationStatus: 'İzlenmeye Başlanmadı', // Default value
              progressPercentage: company.status === 'active' ? 75 : 25,
              lastUpdate: company.updated_at,
            })
          );
          setCompanies(transformedCompanies);
        }
        setShowAddModal(false);
        // Şifre bilgisini göster
        const passwordMessage = `Firma başarıyla eklendi!\n\nFirma Giriş Bilgileri:\nEmail: ${formData.email}\nŞifre: ${data.password}\n\nBu bilgileri firma yetkilisine iletmeyi unutmayın!`;
        alert(passwordMessage);
      } else {
        alert('Firma eklenirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      alert('Firma eklenirken hata oluştu!');
    }
  };
  // V1.8: Gelişmiş Arama ve Filtreleme Sistemi
  const filteredCompanies = useMemo(() => {
    let filtered = companies;
    // Temel arama filtresi
    if (searchQuery.length >= 2) {
      filtered = filtered.filter(
        company =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (company.authorizedPerson &&
            company.authorizedPerson
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (company.subBrand &&
            company.subBrand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    // Gelişmiş arama filtreleri
    if (showAdvancedSearch) {
      if (advancedSearch.companyName) {
        filtered = filtered.filter(company =>
          company.name
            .toLowerCase()
            .includes(advancedSearch.companyName.toLowerCase())
        );
      }
      if (advancedSearch.authorizedPerson) {
        filtered = filtered.filter(
          company =>
            company.authorizedPerson &&
            company.authorizedPerson
              .toLowerCase()
              .includes(advancedSearch.authorizedPerson.toLowerCase())
        );
      }
      if (advancedSearch.sector) {
        filtered = filtered.filter(company =>
          company.sector
            .toLowerCase()
            .includes(advancedSearch.sector.toLowerCase())
        );
      }
      if (advancedSearch.city) {
        filtered = filtered.filter(company =>
          company.city.toLowerCase().includes(advancedSearch.city.toLowerCase())
        );
      }
      if (advancedSearch.phone) {
        filtered = filtered.filter(
          company =>
            company.phone && company.phone.includes(advancedSearch.phone)
        );
      }
      if (advancedSearch.email) {
        filtered = filtered.filter(
          company =>
            company.email &&
            company.email
              .toLowerCase()
              .includes(advancedSearch.email.toLowerCase())
        );
      }
      if (advancedSearch.website) {
        filtered = filtered.filter(
          company =>
            company.website &&
            company.website
              .toLowerCase()
              .includes(advancedSearch.website.toLowerCase())
        );
      }
    }
    // Diğer filtreler
    if (selectedConsultant) {
      filtered = filtered.filter(
        company => company.consultant === selectedConsultant
      );
    }
    if (selectedRegistrationStatus) {
      filtered = filtered.filter(
        company => company.registrationStatus === selectedRegistrationStatus
      );
    }
    if (selectedDysRecord) {
      filtered = filtered.filter(
        company =>
          (selectedDysRecord === 'Evet' && company.dysRecord) ||
          (selectedDysRecord === 'Hayır' && !company.dysRecord)
      );
    }
    if (selectedEducationStatus) {
      filtered = filtered.filter(
        company => company.educationStatus === selectedEducationStatus
      );
    }
    // Sıralama
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.lastUpdate);
          bValue = new Date(b.lastUpdate);
          break;
        case 'updated':
          aValue = new Date(a.lastUpdate);
          bValue = new Date(b.lastUpdate);
          break;
        case 'progress':
          aValue = a.progressPercentage;
          bValue = b.progressPercentage;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    return filtered;
  }, [
    companies,
    searchQuery,
    advancedSearch,
    showAdvancedSearch,
    selectedConsultant,
    selectedRegistrationStatus,
    selectedDysRecord,
    selectedEducationStatus,
    sortBy,
    sortOrder,
  ]);
  // V1.8: Arama Geçmişi ve Favori Filtreler
  const addToSearchHistory = (query: string) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory.slice(0, 9)]; // Son 10 arama
      setSearchHistory(newHistory);
      localStorage.setItem('companySearchHistory', JSON.stringify(newHistory));
    }
  };
  const saveFavoriteFilter = () => {
    const filterName = prompt('Filtre adını girin:');
    if (filterName) {
      const newFavorite = {
        id: Date.now().toString(),
        name: filterName,
        filters: {
          searchQuery,
          advancedSearch,
          selectedConsultant,
          selectedRegistrationStatus,
          selectedDysRecord,
          selectedEducationStatus,
          sortBy,
          sortOrder,
        },
      };
      const newFavorites = [...favoriteFilters, newFavorite];
      setFavoriteFilters(newFavorites);
      localStorage.setItem(
        'companyFavoriteFilters',
        JSON.stringify(newFavorites)
      );
    }
  };
  const loadFavoriteFilter = (favorite: any) => {
    setSearchQuery(favorite.filters.searchQuery || '');
    setAdvancedSearch(favorite.filters.advancedSearch || {});
    setSelectedConsultant(favorite.filters.selectedConsultant || '');
    setSelectedRegistrationStatus(
      favorite.filters.selectedRegistrationStatus || ''
    );
    setSelectedDysRecord(favorite.filters.selectedDysRecord || '');
    setSelectedEducationStatus(favorite.filters.selectedEducationStatus || '');
    setSortBy(favorite.filters.sortBy || 'name');
    setSortOrder(favorite.filters.sortOrder || 'asc');
  };
  const deleteFavoriteFilter = (id: string) => {
    const newFavorites = favoriteFilters.filter(f => f.id !== id);
    setFavoriteFilters(newFavorites);
    localStorage.setItem(
      'companyFavoriteFilters',
      JSON.stringify(newFavorites)
    );
  };
  const clearFilters = () => {
    setSearchQuery('');
    setAdvancedSearch({
      companyName: '',
      authorizedPerson: '',
      sector: '',
      city: '',
      phone: '',
      email: '',
      website: '',
    });
    setSelectedConsultant('');
    setSelectedRegistrationStatus('');
    setSelectedDysRecord('');
    setSelectedEducationStatus('');
    setSortBy('name');
    setSortOrder('asc');
    setShowAdvancedSearch(false);
  };
  const handleCompanyClick = (companyId: string) => {
    router.push(`/admin/firma-yonetimi/${companyId}`);
  };
  const handleAssignConsultant = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowAssignModal(true);
  };
  const handleViewNotes = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowNotesModal(true);
  };
  const handleEditCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowEditModal(true);
  };
  const handleDeleteCompany = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (
      !confirm(
        `"${company?.name}" firmasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve tüm firma verileri kalıcı olarak silinecektir.`
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh companies list
        const refreshResponse = await fetch('/api/companies', {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          // Transform API data to match frontend expectations
          const transformedCompanies = (refreshData.companies || []).map(
            (company: any) => ({
              ...company,
              sector: company.industry || 'Belirtilmemiş',
              authorizedPerson: 'Atanmamış', // Default value
              subBrand: company.description
                ? company.description.substring(0, 50) + '...'
                : 'Belirtilmemiş',
              consultant: 'Atanmamış', // Default value
              registrationStatus:
                company.status === 'active' ? 'Tamamlandı' : 'Tamamlanmadı',
              dysRecord: false, // Default value
              educationStatus: 'İzlenmeye Başlanmadı', // Default value
              progressPercentage: company.status === 'active' ? 75 : 25,
              lastUpdate: company.updated_at,
            })
          );
          setCompanies(transformedCompanies);
        }
        alert('Firma başarıyla silindi!');
      } else {
        alert('Firma silinirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      alert('Firma silinirken hata oluştu!');
    }
  };
  const handleUpdateCompany = async (formData: any) => {
    try {
      const response = await fetch(`/api/companies/${selectedCompanyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          website: formData.website,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          sector: formData.sector,
          email: formData.email,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh companies list
        const refreshResponse = await fetch('/api/companies', {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          // Transform API data to match frontend expectations
          const transformedCompanies = (refreshData.companies || []).map(
            (company: any) => ({
              ...company,
              sector: company.industry || 'Belirtilmemiş',
              authorizedPerson: 'Atanmamış', // Default value
              subBrand: company.description
                ? company.description.substring(0, 50) + '...'
                : 'Belirtilmemiş',
              consultant: 'Atanmamış', // Default value
              registrationStatus:
                company.status === 'active' ? 'Tamamlandı' : 'Tamamlanmadı',
              dysRecord: false, // Default value
              educationStatus: 'İzlenmeye Başlanmadı', // Default value
              progressPercentage: company.status === 'active' ? 75 : 25,
              lastUpdate: company.updated_at,
            })
          );
          setCompanies(transformedCompanies);
        }
        setShowEditModal(false);
        alert('Firma başarıyla güncellendi!');
      } else {
        alert('Firma güncellenirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      alert('Firma güncellenirken hata oluştu!');
    }
  };
  const exportToExcel = () => {};
  const generateBulkReport = () => {};
  const handleManagePassword = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowPasswordModal(true);
  };
  const applyFilters = () => {};
  const updateConsultant = (newConsultant: string) => {
    if (selectedCompanyId) {
      setCompanies(
        companies.map(c =>
          c.id === selectedCompanyId ? { ...c, consultant: newConsultant } : c
        )
      );
      // Danışman ataması yapıldı: Firma ${selectedCompanyId} -> ${newConsultant} - ${new Date().toISOString()}
      setShowAssignModal(false);
    }
  };
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: '5 yeni firma kaydı beklemede',
      time: '2 dk önce',
      unread: true,
    },
    {
      id: 2,
      type: 'warning',
      message: 'Sistem bakımı planlandı',
      time: '15 dk önce',
      unread: true,
    },
    {
      id: 3,
      type: 'success',
      message: 'Aylık rapor hazırlandı',
      time: '1 saat önce',
      unread: false,
    },
    {
      id: 4,
      type: 'error',
      message: 'API bağlantı hatası düzeltildi',
      time: '3 saat önce',
      unread: false,
    },
  ];
  const unreadNotifications = notifications.filter(n => n.unread).length;
  return (
    <AdminLayout
      title='Firma Yönetimi'
      description='Sisteme kayıtlı tüm firmaları yönetin, filtreleyin ve raporlayın'
    >
      {/* Header Actions */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Firma Yönetimi</h2>
          <p className='text-gray-600 mt-1'>
            Sisteme kayıtlı tüm firmaları yönetin, filtreleyin ve raporlayın
          </p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={handleAddCompany}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
          >
            Firma Ekle
          </button>
          <LazyExportImport type='companies' />
          <button
            onClick={generateBulkReport}
            className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
          >
            Toplu Rapor Oluştur
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>Toplam Firma</p>
              <p className='text-2xl font-bold text-gray-900'>
                {companies.length}
              </p>
            </div>
            <div className='bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-building-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Kayıt Tamamlandı
              </p>
              <p className='text-2xl font-bold text-green-600'>
                {
                  companies.filter(c => c.registrationStatus === 'Tamamlandı')
                    .length
                }
              </p>
            </div>
            <div className='bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-checkbox-circle-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>İncelemede</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {
                  companies.filter(c => c.registrationStatus === 'İncelemede')
                    .length
                }
              </p>
            </div>
            <div className='bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-time-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>DYS Kayıtlı</p>
              <p className='text-2xl font-bold text-purple-600'>
                {companies.filter(c => c.dysRecord).length}
              </p>
            </div>
            <div className='bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-shield-check-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Eğitim Tamamlandı
              </p>
              <p className='text-2xl font-bold text-blue-600'>
                {
                  companies.filter(c => c.educationStatus === 'Tamamlandı')
                    .length
                }
              </p>
            </div>
            <div className='bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-graduation-cap-line text-white text-xl'></i>
            </div>
          </div>
        </div>
      </div>
      {/* V1.8: Gelişmiş Arama ve Filtreler */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <i className='ri-filter-3-line text-blue-600'></i>
            Gelişmiş Arama ve Filtreler
          </h3>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className='text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer flex items-center gap-1'
            >
              <i
                className={`ri-arrow-down-s-line transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`}
              ></i>
              {showAdvancedSearch ? 'Basit Arama' : 'Gelişmiş Arama'}
            </button>
            <button
              onClick={saveFavoriteFilter}
              className='text-green-600 hover:text-green-700 text-sm font-medium cursor-pointer flex items-center gap-1'
            >
              <i className='ri-heart-add-line'></i>
              Favori Kaydet
            </button>
            <button
              onClick={clearFilters}
              className='text-gray-600 hover:text-gray-800 text-sm font-medium cursor-pointer'
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
        {/* V1.8: Arama Geçmişi ve Favori Filtreler */}
        {(searchHistory.length > 0 || favoriteFilters.length > 0) && (
          <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
            <div className='flex flex-wrap gap-2'>
              {searchHistory.slice(0, 3).map((query, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(query)}
                  className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors'
                >
                  {query}
                </button>
              ))}
              {favoriteFilters.slice(0, 3).map(favorite => (
                <button
                  key={favorite.id}
                  onClick={() => loadFavoriteFilter(favorite)}
                  className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors flex items-center gap-1'
                >
                  <i className='ri-heart-fill text-xs'></i>
                  {favorite.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* V1.8: Sıralama Seçenekleri */}
        <div className='mb-4 flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700'>Sırala:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className='px-3 py-1 border border-gray-300 rounded text-sm'
            >
              <option value='name'>Firma Adı</option>
              <option value='created'>Oluşturulma Tarihi</option>
              <option value='updated'>Güncelleme Tarihi</option>
              <option value='progress'>İlerleme Yüzdesi</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className='p-1 hover:bg-gray-100 rounded'
            >
              <i
                className={`ri-sort-${sortOrder === 'asc' ? 'asc' : 'desc'}`}
              ></i>
            </button>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Firma Adı
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                <i className='ri-search-line text-gray-400 text-sm'></i>
              </div>
              <input
                type='text'
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    addToSearchHistory(e.target.value);
                  }
                }}
                placeholder='Firma adı, yetkili kişi ara... (min 2 karakter)'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              />
              {/* V1.8: Arama Önerileri */}
              {searchSuggestions.length > 0 && searchQuery.length >= 2 && (
                <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1'>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(suggestion)}
                      className='w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0'
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className='text-xs text-red-500 mt-1'>
                En az 2 karakter girmelisiniz
              </p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Danışman
            </label>
            <select
              value={selectedConsultant}
              onChange={e => setSelectedConsultant(e.target.value)}
              className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            >
              <option value=''>Tüm Danışmanlar</option>
              {consultants.map((consultant, index) => (
                <option key={`${consultant}-${index}`} value={consultant}>
                  {consultant}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Kayıt Durumu
            </label>
            <select
              value={selectedRegistrationStatus}
              onChange={e => setSelectedRegistrationStatus(e.target.value)}
              className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            >
              <option value=''>Tüm Durumlar</option>
              <option value='Tamamlanmadı'>Tamamlanmadı</option>
              <option value='İncelemede'>İncelemede</option>
              <option value='Tamamlandı'>Tamamlandı</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              DYS Kaydı Var mı?
            </label>
            <select
              value={selectedDysRecord}
              onChange={e => setSelectedDysRecord(e.target.value)}
              className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            >
              <option value=''>Hepsi</option>
              <option value='Evet'>Evet</option>
              <option value='Hayır'>Hayır</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Eğitim Durumu
            </label>
            <select
              value={selectedEducationStatus}
              onChange={e => setSelectedEducationStatus(e.target.value)}
              className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            >
              <option value=''>Tüm Durumlar</option>
              <option value='İzlenmeye Başlanmadı'>İzlenmeye Başlanmadı</option>
              <option value='Devam Ediyor'>Devam Ediyor</option>
              <option value='Tamamlandı'>Tamamlandı</option>
            </select>
          </div>
        </div>
        {/* V1.8: Gelişmiş Arama Alanları */}
        {showAdvancedSearch && (
          <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
            <h4 className='text-sm font-medium text-blue-900 mb-3 flex items-center gap-2'>
              <i className='ri-search-eye-line'></i>
              Gelişmiş Arama
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Firma Adı
                </label>
                <input
                  type='text'
                  value={advancedSearch.companyName}
                  onChange={e =>
                    setAdvancedSearch({
                      ...advancedSearch,
                      companyName: e.target.value,
                    })
                  }
                  placeholder='Firma adı ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Yetkili Kişi
                </label>
                <input
                  type='text'
                  value={advancedSearch.authorizedPerson}
                  onChange={e =>
                    setAdvancedSearch({
                      ...advancedSearch,
                      authorizedPerson: e.target.value,
                    })
                  }
                  placeholder='Yetkili kişi ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Sektör
                </label>
                <input
                  type='text'
                  value={advancedSearch.sector}
                  onChange={e =>
                    setAdvancedSearch({
                      ...advancedSearch,
                      sector: e.target.value,
                    })
                  }
                  placeholder='Sektör ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Şehir
                </label>
                <input
                  type='text'
                  value={advancedSearch.city}
                  onChange={e =>
                    setAdvancedSearch({
                      ...advancedSearch,
                      city: e.target.value,
                    })
                  }
                  placeholder='Şehir ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Telefon
                </label>
                <input
                  type='text'
                  value={advancedSearch.phone}
                  onChange={e =>
                    setAdvancedSearch({
                      ...advancedSearch,
                      phone: e.target.value,
                    })
                  }
                  placeholder='Telefon ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  E-posta
                </label>
                <input
                  type='text'
                  value={advancedSearch.email}
                  onChange={e =>
                    setAdvancedSearch({
                      ...advancedSearch,
                      email: e.target.value,
                    })
                  }
                  placeholder='E-posta ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Website
                </label>
                <input
                  type='text'
                  value={advancedSearch.website}
                  onChange={e =>
                    setAdvancedSearch({
                      ...advancedSearch,
                      website: e.target.value,
                    })
                  }
                  placeholder='Website ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
            </div>
          </div>
        )}
        <div className='flex justify-between items-center'>
          <div className='text-sm text-gray-600'>
            <span className='font-medium'>{filteredCompanies.length}</span>{' '}
            firma bulundu
            {searchQuery.length >= 2 && (
              <span className='ml-2 text-blue-600'>
                &quot;{searchQuery}&quot; araması için
              </span>
            )}
          </div>
          {(searchQuery ||
            selectedConsultant ||
            selectedRegistrationStatus ||
            selectedDysRecord ||
            selectedEducationStatus) && (
            <div className='text-xs text-gray-500'>
              Aktif filtre:{' '}
              {[
                searchQuery && `"${searchQuery}"`,
                selectedConsultant && `Danışman: ${selectedConsultant}`,
                selectedRegistrationStatus &&
                  `Durum: ${selectedRegistrationStatus}`,
                selectedDysRecord && `DYS: ${selectedDysRecord}`,
                selectedEducationStatus && `Eğitim: ${selectedEducationStatus}`,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </div>
      </div>
      {/* Loading State */}
      {companiesLoading && (
        <LoadingEmptyState message='Firma verileri yükleniyor...' />
      )}
      {/* Error State */}
      {companiesError && (
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-2xl text-red-600'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-gray-600 mb-4'>{companiesError}</p>
          <button
            onClick={() => {
              setCompaniesError(null);
              // Re-fetch data
              const fetchCompanies = async () => {
                try {
                  setCompaniesLoading(true);
                  const response = await fetch('/api/companies', {
                    headers: {
                      'X-User-Email': 'admin@ihracatakademi.com',
                    },
                  });
                  const data = await response.json();
                  if (response.ok) {
                    // Transform API data to match frontend expectations
                    const transformedCompanies = (data.companies || [])
                      .filter((company: any) => company && company.id) // Filter out invalid companies
                      .map((company: any) => ({
                        ...company,
                        // Ensure name is always a valid string
                        name:
                          company.name && company.name.trim() !== ''
                            ? company.name.trim()
                            : `Firma ${company.id.substring(0, 8)}...`, // Use ID prefix if name is missing
                        sector: company.industry || 'Belirtilmemiş',
                        authorizedPerson: 'Atanmamış', // Default value
                        subBrand: company.description
                          ? company.description.substring(0, 50) + '...'
                          : 'Belirtilmemiş',
                        consultant: 'Atanmamış', // Default value
                        registrationStatus:
                          company.status === 'active'
                            ? 'Tamamlandı'
                            : 'Tamamlanmadı',
                        dysRecord: false, // Default value
                        educationStatus: 'İzlenmeye Başlanmadı', // Default value
                        progressPercentage:
                          company.status === 'active' ? 75 : 25,
                        lastUpdate: company.updated_at,
                      }))
                      .sort((a: any, b: any) => {
                        // Sort by name, but put "Belirtilmemiş" names at the end
                        const aName = a.name.toLowerCase();
                        const bName = b.name.toLowerCase();
                        if (aName.includes('firma') && aName.includes('...'))
                          return 1;
                        if (bName.includes('firma') && bName.includes('...'))
                          return -1;
                        return aName.localeCompare(bName);
                      });
                    setCompanies(transformedCompanies);
                    setCompaniesError(null);
                  } else {
                    setCompaniesError(
                      data.error || 'Firma verileri yüklenirken hata oluştu'
                    );
                  }
                } catch (error) {
                  setCompaniesError('Firma verileri yüklenirken hata oluştu');
                } finally {
                  setCompaniesLoading(false);
                }
              };
              fetchCompanies();
            }}
            className='bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors'
          >
            Tekrar Dene
          </button>
        </div>
      )}
      {/* Company List */}
      {!companiesLoading && !companiesError && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCompanies.map((company: any) => (
            <CompanyCard
              key={company.id}
              company={company}
              onClick={() => handleCompanyClick(company.id)}
              onAssignConsultant={handleAssignConsultant}
              onViewNotes={handleViewNotes}
              onDeleteCompany={handleDeleteCompany}
              onEditCompany={handleEditCompany}
              onManagePassword={handleManagePassword}
              onGoToCompany={handleGoToCompany}
            />
          ))}
        </div>
      )}
      {filteredCompanies.length === 0 && (
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-building-line text-2xl text-gray-400'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            {searchQuery.length > 0 && searchQuery.length < 2
              ? 'Arama için en az 2 karakter girmelisiniz'
              : 'Filtrelerinize uygun firma bulunamadı'}
          </h3>
          {searchQuery.length >= 2 && (
            <p className='text-gray-500 mb-4'>
              &quot;{searchQuery}&quot; aramanız için sonuç bulunamadı
            </p>
          )}
          <button
            onClick={clearFilters}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap'
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
      {/* Assign Consultant Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Danışman Ata / Değiştir"
        size="md"
      >
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Yeni Danışman Seçin
          </label>
          <select
            defaultValue={
              companies.find(c => c.id === selectedCompanyId)
                ?.consultant || ''
            }
            onChange={e => updateConsultant(e.target.value)}
            className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value=''>Danışman Seçiniz</option>
            {consultants.map((consultant, index) => (
              <option key={`${consultant}-${index}`} value={consultant}>
                {consultant}
              </option>
            ))}
          </select>
        </div>
      </Modal>
      {/* Notes Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="Firma Notları"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowNotesModal(false);
                // Notlar güncellendi - Firma: ${selectedCompanyId} - ${new Date().toISOString()}
              }}
            >
              Kaydet
            </Button>
          </>
        }
      >
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Notlar
          </label>
          <textarea
            rows={6}
            defaultValue={
              companies.find(c => c.id === selectedCompanyId)?.notes || ''
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='Firma hakkında özel notlarınızı buraya yazabilirsiniz...'
          />
        </div>
      </Modal>
      {/* Add Company Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Yeni Firma Ekle"
        size="lg"
      >
        <AddCompanyForm
          onSave={handleSaveCompany}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
      {/* Edit Company Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Firma Düzenle"
        size="lg"
      >
        <EditCompanyForm
          company={companies.find(c => c.id === selectedCompanyId)}
          onSave={handleUpdateCompany}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
      {/* Password Management Modal */}
      {showPasswordModal && (
        <PasswordManagementModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          companyId={selectedCompanyId}
          companyName={
            companies.find(c => c.id === selectedCompanyId)?.name || ''
          }
        />
      )}
    </AdminLayout>
  );
}
// Edit Company Form Component
const EditCompanyForm = ({
  company,
  onSave,
  onCancel,
}: {
  company: Company | undefined;
  onSave: (formData: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    sector: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Load company data when component mounts
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        email: company.email || '',
        description: company.description || '',
        website: company.website || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        sector: company.sector || '',
      });
    }
  }, [company]);
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Firma adı gereklidir';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!formData.sector.trim()) {
      newErrors.sector = 'Sektör gereklidir';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Şehir gereklidir';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!company) {
    return (
      <div className='p-6 text-center text-gray-500'>Firma bulunamadı</div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className='p-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Firma Adı *
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='Firma adını giriniz'
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            E-posta Adresi *
          </label>
          <input
            type='email'
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='E-posta adresini giriniz'
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Sektör *
          </label>
          <select
            value={formData.sector}
            onChange={e => setFormData({ ...formData, sector: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.sector ? 'border-red-300' : 'border-gray-300'}`}
          >
            <option value=''>Sektör Seçiniz</option>
            <option value='Tekstil'>Tekstil</option>
            <option value='Gıda'>Gıda</option>
            <option value='Teknoloji'>Teknoloji</option>
            <option value='Otomotiv'>Otomotiv</option>
            <option value='Makina'>Makina</option>
            <option value='Elektronik'>Elektronik</option>
            <option value='Kimya'>Kimya</option>
            <option value='İnşaat'>İnşaat</option>
            <option value='Diğer'>Diğer</option>
          </select>
          {errors.sector && (
            <p className='text-red-500 text-sm mt-1'>{errors.sector}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Şehir *
          </label>
          <input
            type='text'
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='Şehir giriniz'
          />
          {errors.city && (
            <p className='text-red-500 text-sm mt-1'>{errors.city}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Telefon
          </label>
          <input
            type='tel'
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='Telefon numarası'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Website
          </label>
          <input
            type='text'
            value={formData.website}
            onChange={e =>
              setFormData({ ...formData, website: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='www.example.com veya https://example.com'
          />
        </div>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='Firma hakkında kısa açıklama'
          />
        </div>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Adres
          </label>
          <textarea
            value={formData.address}
            onChange={e =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows={2}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='Firma adresi'
          />
        </div>
      </div>
      <div className='flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          İptal
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isSubmitting ? (
            <>
              <i className='ri-loader-4-line animate-spin mr-2'></i>
              Güncelleniyor...
            </>
          ) : (
            'Firma Güncelle'
          )}
        </button>
      </div>
    </form>
  );
};
// Add Company Form Component
const AddCompanyForm = ({
  onSave,
  onCancel,
}: {
  onSave: (formData: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    sector: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Firma adı gereklidir';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }
    if (!formData.sector.trim()) {
      newErrors.sector = 'Sektör gereklidir';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Şehir gereklidir';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className='p-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Firma Adı *
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='Firma adını giriniz'
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Email Adresi *
          </label>
          <input
            type='email'
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='firma@example.com'
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Sektör *
          </label>
          <select
            value={formData.sector}
            onChange={e => setFormData({ ...formData, sector: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.sector ? 'border-red-300' : 'border-gray-300'}`}
          >
            <option value=''>Sektör Seçiniz</option>
            <option value='Tekstil'>Tekstil</option>
            <option value='Gıda'>Gıda</option>
            <option value='Teknoloji'>Teknoloji</option>
            <option value='Otomotiv'>Otomotiv</option>
            <option value='Makina'>Makina</option>
            <option value='Elektronik'>Elektronik</option>
            <option value='Kimya'>Kimya</option>
            <option value='İnşaat'>İnşaat</option>
            <option value='Diğer'>Diğer</option>
          </select>
          {errors.sector && (
            <p className='text-red-500 text-sm mt-1'>{errors.sector}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Şehir *
          </label>
          <input
            type='text'
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='Şehir giriniz'
          />
          {errors.city && (
            <p className='text-red-500 text-sm mt-1'>{errors.city}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Telefon
          </label>
          <input
            type='tel'
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='Telefon numarası'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Website
          </label>
          <input
            type='text'
            value={formData.website}
            onChange={e =>
              setFormData({ ...formData, website: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='www.example.com veya https://example.com'
          />
        </div>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='Firma hakkında kısa açıklama'
          />
        </div>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Adres
          </label>
          <textarea
            value={formData.address}
            onChange={e =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows={2}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            placeholder='Firma adresi'
          />
        </div>
      </div>
      <div className='flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          İptal
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isSubmitting ? (
            <>
              <i className='ri-loader-4-line animate-spin mr-2'></i>
              Ekleniyor...
            </>
          ) : (
            'Firma Ekle'
          )}
        </button>
      </div>
    </form>
  );
};
// Şifre Yönetimi Modal Bileşeni
const PasswordManagementModal = ({
  isOpen,
  onClose,
  companyId,
  companyName,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
}) => {
  const [action, setAction] = useState<'view' | 'generate' | 'reset'>('view');
  const [password, setPassword] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{
    has_password: boolean;
    password_created_at: string | null;
    password_updated_at: string | null;
  } | null>(null);
  useEffect(() => {
    if (isOpen && companyId) {
      checkPasswordStatus();
    }
  }, [isOpen, companyId, checkPasswordStatus]);
  const checkPasswordStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/password`);
      const data = await response.json();
      if (response.ok) {
        setPasswordStatus(data);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Şifre durumu kontrol edilemedi',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası' });
    }
  }, [companyId]);
  const handleGeneratePassword = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/companies/${companyId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });
      const data = await response.json();
      if (response.ok) {
        setPassword(data.password);
        setMessage({ type: 'success', text: 'Şifre başarıyla oluşturuldu' });
        checkPasswordStatus();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Şifre oluşturulamadı',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası' });
    } finally {
      setIsLoading(false);
    }
  };
  const handleResetPassword = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/companies/${companyId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await response.json();
      if (response.ok) {
        setResetToken(data.token);
        setMessage({
          type: 'success',
          text: "Şifre sıfırlama token'ı oluşturuldu",
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Token oluşturulamadı',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası' });
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdatePassword = async () => {
    if (!resetToken || !newPassword) {
      setMessage({ type: 'error', text: 'Token ve yeni şifre gerekli' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/companies/${companyId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          token: resetToken,
          newPassword: newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Şifre başarıyla güncellendi' });
        setResetToken('');
        setNewPassword('');
        checkPasswordStatus();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Şifre güncellenemedi',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası' });
    } finally {
      setIsLoading(false);
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Kopyalandı!' });
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Şifre Yönetimi
            </h2>
            <button
              onClick={onClose}
              className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
            >
              <i className='ri-close-line text-gray-600'></i>
            </button>
          </div>
          <p className='text-sm text-gray-600 mt-2'>{companyName}</p>
        </div>
        <div className='p-6'>
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
          {passwordStatus && (
            <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-medium text-gray-900 mb-2'>Şifre Durumu</h3>
              <div className='space-y-1 text-sm'>
                <p>
                  Durum:{' '}
                  <span
                    className={
                      passwordStatus.has_password
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {passwordStatus.has_password ? 'Şifre Mevcut' : 'Şifre Yok'}
                  </span>
                </p>
                {passwordStatus.password_created_at && (
                  <p>
                    Oluşturulma:{' '}
                    {new Date(
                      passwordStatus.password_created_at
                    ).toLocaleDateString('tr-TR')}
                  </p>
                )}
                {passwordStatus.password_updated_at && (
                  <p>
                    Güncellenme:{' '}
                    {new Date(
                      passwordStatus.password_updated_at
                    ).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className='space-y-4'>
            {action === 'view' && (
              <>
                <button
                  onClick={() => setAction('generate')}
                  className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <i className='ri-key-line mr-2'></i>
                  Yeni Şifre Oluştur
                </button>
                <button
                  onClick={() => setAction('reset')}
                  className='w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'
                >
                  <i className='ri-refresh-line mr-2'></i>
                  Şifre Sıfırla
                </button>
              </>
            )}
            {action === 'generate' && (
              <div className='space-y-4'>
                <div className='text-center'>
                  <p className='text-sm text-gray-600 mb-4'>
                    Güvenli bir şifre oluşturmak için aşağıdaki butona tıklayın.
                  </p>
                  <button
                    onClick={handleGeneratePassword}
                    disabled={isLoading}
                    className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors'
                  >
                    {isLoading ? (
                      <>
                        <i className='ri-loader-4-line animate-spin mr-2'></i>
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <i className='ri-magic-line mr-2'></i>
                        Şifre Oluştur
                      </>
                    )}
                  </button>
                </div>
                {password && (
                  <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <h4 className='font-medium text-green-900 mb-2'>
                      Oluşturulan Şifre:
                    </h4>
                    <div className='flex items-center gap-2'>
                      <code className='flex-1 p-2 bg-white border border-green-300 rounded text-sm font-mono'>
                        {password}
                      </code>
                      <button
                        onClick={() => copyToClipboard(password)}
                        className='px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
                        title='Kopyala'
                      >
                        <i className='ri-file-copy-line'></i>
                      </button>
                    </div>
                    <p className='text-xs text-green-700 mt-2'>
                      ⚠️ Bu şifreyi güvenli bir yere kaydedin. Bir daha
                      görüntülenemeyecek.
                    </p>
                  </div>
                )}
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setAction('view');
                      setPassword('');
                    }}
                    className='flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                  >
                    Geri
                  </button>
                </div>
              </div>
            )}
            {action === 'reset' && (
              <div className='space-y-4'>
                {!resetToken ? (
                  <div className='text-center'>
                    <p className='text-sm text-gray-600 mb-4'>
                      Şifre sıfırlama token&apos;ı oluşturmak için aşağıdaki
                      butona tıklayın.
                    </p>
                    <button
                      onClick={handleResetPassword}
                      disabled={isLoading}
                      className='px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors'
                    >
                      {isLoading ? (
                        <>
                          <i className='ri-loader-4-line animate-spin mr-2'></i>
                          Token Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <i className='ri-refresh-line mr-2'></i>
                          Token Oluştur
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='p-4 bg-orange-50 border border-orange-200 rounded-lg'>
                      <h4 className='font-medium text-orange-900 mb-2'>
                        Sıfırlama Token&apos;ı:
                      </h4>
                      <div className='flex items-center gap-2'>
                        <code className='flex-1 p-2 bg-white border border-orange-300 rounded text-sm font-mono break-all'>
                          {resetToken}
                        </code>
                        <button
                          onClick={() => copyToClipboard(resetToken)}
                          className='px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors'
                          title='Kopyala'
                        >
                          <i className='ri-file-copy-line'></i>
                        </button>
                      </div>
                      <p className='text-xs text-orange-700 mt-2'>
                        Bu token 24 saat geçerlidir.
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Yeni Şifre
                      </label>
                      <input
                        type='password'
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        placeholder='Yeni şifreyi girin'
                        minLength={8}
                      />
                    </div>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={!newPassword || isLoading}
                      className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                    >
                      {isLoading ? (
                        <>
                          <i className='ri-loader-4-line animate-spin mr-2'></i>
                          Güncelleniyor...
                        </>
                      ) : (
                        'Şifreyi Güncelle'
                      )}
                    </button>
                  </div>
                )}
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setAction('view');
                      setResetToken('');
                      setNewPassword('');
                    }}
                    className='flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                  >
                    Geri
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
