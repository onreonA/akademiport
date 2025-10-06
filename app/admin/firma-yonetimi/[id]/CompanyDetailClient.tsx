// Merged code
'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
interface ActivityHistory {
  id: string;
  type: 'create' | 'update' | 'delete' | 'note';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  details?: string;
}
interface NewNote {
  title: string;
  description: string;
}
interface DocumentRequest {
  id: string;
  companyId: string;
  documentType: string;
  status: string;
  requestedAt: string;
  submittedAt?: string;
  notes?: string;
}
interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}
// ... existing interface definitions ...
interface Company {
  id: string;
  name: string;
  subBrand?: string;
  authorizedPerson: string;
  sector: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  website?: string;
  foundationYear: string;
  employeeCount: string;
  taxNumber?: string;
  description?: string;
  exportExperience: boolean;
  targetMarkets: string[];
  products?: string[];
  sales?: {
    sales_team?: string;
    sales_channels?: string;
    sales_targets?: string;
    customer_segments?: string;
    pricing_strategy?: string;
    sales_process?: string;
    sales_tools?: string;
    sales_training?: string;
    sales_performance?: string;
    sales_forecasting?: string;
    sales_automation?: string;
    sales_analytics?: string;
    sales_management?: string;
    sales_optimization?: string;
    sales_innovation?: string;
    customer_retention?: string;
    crm?: string;
    customer_service?: string;
    sales_performance_tracking?: string;
    customer_satisfaction_measurement?: string;
    sales_strategy?: string;
  };
  content?: {
    content_strategy?: string;
    content_creation?: string;
    content_distribution?: string;
    content_management?: string;
    content_optimization?: string;
    content_analytics?: string;
    content_calendar?: string;
    content_templates?: string;
    content_workflow?: string;
    content_quality?: string;
    content_branding?: string;
    content_localization?: string;
    content_personalization?: string;
    content_automation?: string;
    brand_identity?: string;
    visual_identity?: string;
    marketing_materials?: string;
    language_support?: string;
    brand_positioning?: string;
    communication_channels?: string;
    target_audience_analysis?: string;
    brand_story?: string;
  };
  certification?: string[];
  activityHistory?: ActivityHistory[];
  projectStatus?: string;
  production?: {
    production_capacity?: string;
    production_process?: string;
    quality_control?: string;
    certifications?: string[];
    production_facilities?: string;
    supply_chain?: string;
    logistics?: string;
    warehousing?: string;
    delivery_time?: string;
    production_technologies?: string;
    environmental_friendly?: string;
    quality_management?: string[];
    environmental_cert?: string[];
    occupational_safety?: string[];
    industry_associations?: string[];
    chambers?: string[];
  };
  digital?: {
    website_quality?: string;
    social_media_presence?: string;
    online_marketing?: string;
    current_platforms?: string;
    website_status?: string;
    ecommerce_experience?: string;
    digital_marketing?: string;
    social_media?: string;
    online_payment?: string;
    digital_tools?: string;
    tech_support?: string;
    digital_transformation_goals?: string;
    digital_marketing_strategy?: string;
  };
  certifications: string[];
  competitiveAdvantages: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  registrationStatus: 'Tamamlanmadı' | 'İncelemede' | 'Tamamlandı';
  consultant: string;
  progressPercentage: number;
  lastUpdate: string;
  dysRecord: boolean;
  educationStatus: 'İzlenmeye Başlanmadı' | 'Devam Ediyor' | 'Tamamlandı';
  // Extended properties from API
  generalInfo?: {
    company_name?: string;
    authorized_person?: string;
    email?: string;
    phone?: string;
    sector?: string;
    city?: string;
    address?: string;
    website?: string;
    founded_year?: string;
    employee_count?: string;
    tax_number?: string;
    legal_structure?: string;
    capital?: string;
    description?: string;
  };
  markets?: {
    current_markets?: string[];
    target_markets?: string[];
    export_experience?: string;
    export_countries?: string[];
    market_research?: string;
    competitor_analysis?: string;
    market_entry?: string[];
    distribution_channels?: string[];
  };
  competitors?: {
    reference_companies?: string[];
    direct_competitors?: string[];
    target_position?: string;
    competitive_advantages?: string;
    price_competition?: string;
    quality_competition?: string;
    market_share_target?: string;
    competitive_strategy?: string;
  };
  productsInfo?: {
    main_products?: string;
    product_categories?: string[];
    production_capacity?: string;
    quality_certificates?: string[];
    product_catalog?: string;
    price_strategy?: string;
    seasonality?: string;
    customization?: string;
    dropshipping?: string;
  };
}
// ... existing interface definitions ...
interface FormData {
  generalInfo: {
    companyName: string;
    authorizedPerson: string;
    email: string;
    phone: string;
    sector: string;
    city: string;
    address: string;
    website: string;
    foundedYear: string;
    employeeCount: string;
    taxNumber: string;
    legalStructure: string;
    capital: string;
    description: string;
  };
  markets: {
    currentMarkets: string[];
    targetMarkets: string[];
    exportExperience: string;
    exportCountries: string[];
    marketResearch: string;
    competitorAnalysis: string;
    marketEntry: string[];
    distributionChannels: string[];
  };
  products: {
    mainProducts: string;
    productCategories: string[];
    productionCapacity: string;
    qualityCertificates: string[];
    productCatalog: string;
    priceStrategy: string;
    seasonality: string;
    customization: string;
    dropshipping: string;
  };
  competitors: {
    referenceCompanies: string[];
    directCompetitors: string[];
    targetPosition: string;
    competitiveAdvantages: string;
    priceCompetition: string;
    qualityCompetition: string;
    marketShareTarget: string;
    competitiveStrategy: string;
  };
  production: {
    productionFacilities: string;
    productionCapacity: string;
    qualityControl: string;
    certifications: string[];
    supplyChain: string;
    logistics: string;
    warehousing: string;
    deliveryTime: string;
    productionTechnologies: string;
    environmentalFriendly: string;
  };
  digital: {
    currentPlatforms: string[];
    websiteStatus: string;
    ecommerceExperience: string;
    digitalMarketing: string[];
    socialMedia: string[];
    onlinePayment: string[];
    digitalTools: string[];
    techSupport: string;
    digitalTransformationGoals: string;
    digitalMarketingStrategy: string;
  };
  sales: {
    salesChannels: string[];
    customerSegments: string;
    customerRetention: string;
    salesProcess: string;
    crm: string;
    customerService: string;
    salesTeam: string;
    salesTargets: string;
    salesPerformanceTracking: string;
    customerSatisfactionMeasurement: string;
    salesStrategy: string;
  };
  content: {
    brandIdentity: string;
    contentStrategy: string;
    visualIdentity: string;
    marketingMaterials: string[];
    languageSupport: string[];
    brandPositioning: string;
    communicationChannels: string[];
    contentCalendar: string;
    contentQuality: string;
    targetAudienceAnalysis: string;
    brandStory: string;
  };
  certification: {
    qualityManagement: string;
    environmentalCert: string;
    occupationalSafety: string;
    industryAssociations: string[];
    chambers: string[];
    exportUnions: string[];
    governmentSupport: string[];
    consultingServices: string[];
    otherCertifications: string;
    certificationRenewalDates: string;
    certificationGoals: string;
  };
}
const MenuItem = ({
  icon,
  title,
  isActive,
  onClick,
  hasSubMenu,
  isExpanded,
}: {
  icon: string;
  title: string;
  isActive?: boolean;
  onClick: () => void;
  hasSubMenu?: boolean;
  isExpanded?: boolean;
}) => (
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
    <span className='ml-3 truncate'>{title}</span>
    {hasSubMenu && (
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
const SubMenuItem = ({
  title,
  isActive,
  onClick,
}: {
  title: string;
  isActive?: boolean;
  onClick: () => void;
}) => (
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
const TabButton = ({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <i className={icon}></i>
    {children}
  </button>
);
export default function CompanyDetailClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('company-management');
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [consultantNote, setConsultantNote] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingTab, setPendingTab] = useState('');
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Await params to get the actual ID
      const resolvedParams = await params;
      if (!resolvedParams.id) {
        setError('Firma ID bulunamadı');
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/companies/${resolvedParams.id}`);
      const data = await response.json();
      if (response.ok) {
        setCompany(data.company);
      } else {
        setError(data.error || 'Firma verileri yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('Firma verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);
  // Update form data when company data is loaded
  useEffect(() => {
    if (company) {
      setCompanyStatus(
        (company.status as 'active' | 'inactive' | 'pending') || 'pending'
      );
      setFormData((prevData: any) => ({
        ...prevData,
        generalInfo: {
          ...prevData.generalInfo,
          // Use data from company_general_info table if available, otherwise fallback to companies table
          companyName: company.generalInfo?.company_name || company.name || '',
          authorizedPerson:
            company.generalInfo?.authorized_person ||
            company.authorizedPerson ||
            '',
          email: company.generalInfo?.email || company.email || '',
          phone: company.generalInfo?.phone || company.phone || '',
          sector: company.generalInfo?.sector || company.sector || '',
          city: company.generalInfo?.city || company.city || '',
          address: company.generalInfo?.address || company.address || '',
          website: company.generalInfo?.website || company.website || '',
          foundedYear:
            company.generalInfo?.founded_year || company.foundationYear || '',
          employeeCount:
            company.generalInfo?.employee_count || company.employeeCount || '',
          taxNumber: company.generalInfo?.tax_number || company.taxNumber || '',
          legalStructure:
            company.generalInfo?.legal_structure ||
            prevData.generalInfo.legalStructure,
          capital: company.generalInfo?.capital || prevData.generalInfo.capital,
          description:
            company.generalInfo?.description || company.description || '',
        },
        // Update other tab data from API with proper field mapping
        markets: company.markets
          ? {
              ...prevData.markets,
              currentMarkets:
                company.markets.current_markets ||
                prevData.markets.currentMarkets,
              targetMarkets:
                company.markets.target_markets ||
                prevData.markets.targetMarkets,
              exportExperience:
                company.markets.export_experience ||
                prevData.markets.exportExperience,
              exportCountries:
                company.markets.export_countries ||
                prevData.markets.exportCountries,
              marketResearch:
                company.markets.market_research ||
                prevData.markets.marketResearch,
              competitorAnalysis:
                company.markets.competitor_analysis ||
                prevData.markets.competitorAnalysis,
              marketEntry:
                company.markets.market_entry || prevData.markets.marketEntry,
              distributionChannels:
                company.markets.distribution_channels ||
                prevData.markets.distributionChannels,
            }
          : prevData.markets,
        products: company.productsInfo
          ? {
              ...prevData.products,
              mainProducts:
                company.productsInfo.main_products ||
                prevData.products.mainProducts,
              productCategories:
                company.productsInfo.product_categories ||
                prevData.products.productCategories,
              productionCapacity:
                company.productsInfo.production_capacity ||
                prevData.products.productionCapacity,
              qualityCertificates:
                company.productsInfo.quality_certificates ||
                prevData.products.qualityCertificates,
              productCatalog:
                company.productsInfo.product_catalog ||
                prevData.products.productCatalog,
              priceStrategy:
                company.productsInfo.price_strategy ||
                prevData.products.priceStrategy,
              seasonality:
                company.productsInfo.seasonality ||
                prevData.products.seasonality,
              customization:
                company.productsInfo.customization ||
                prevData.products.customization,
              dropshipping:
                company.productsInfo.dropshipping ||
                prevData.products.dropshipping,
            }
          : prevData.products,
        competitors: company.competitors
          ? {
              ...prevData.competitors,
              referenceCompanies:
                company.competitors.reference_companies ||
                prevData.competitors.referenceCompanies,
              directCompetitors:
                company.competitors.direct_competitors ||
                prevData.competitors.directCompetitors,
              targetPosition:
                company.competitors.target_position ||
                prevData.competitors.targetPosition,
              competitiveAdvantages:
                company.competitors.competitive_advantages ||
                prevData.competitors.competitiveAdvantages,
              priceCompetition:
                company.competitors.price_competition ||
                prevData.competitors.priceCompetition,
              qualityCompetition:
                company.competitors.quality_competition ||
                prevData.competitors.qualityCompetition,
              marketShareTarget:
                company.competitors.market_share_target ||
                prevData.competitors.marketShareTarget,
              competitiveStrategy:
                company.competitors.competitive_strategy ||
                prevData.competitors.competitiveStrategy,
            }
          : prevData.competitors,
        production: company.production
          ? {
              ...prevData.production,
              productionFacilities:
                company.production.production_facilities ||
                prevData.production.productionFacilities,
              productionCapacity:
                company.production.production_capacity ||
                prevData.production.productionCapacity,
              qualityControl:
                company.production.quality_control ||
                prevData.production.qualityControl,
              certifications:
                company.production.certifications ||
                prevData.production.certifications,
              supplyChain:
                company.production.supply_chain ||
                prevData.production.supplyChain,
              logistics:
                company.production.logistics || prevData.production.logistics,
              warehousing:
                company.production.warehousing ||
                prevData.production.warehousing,
              deliveryTime:
                company.production.delivery_time ||
                prevData.production.deliveryTime,
              productionTechnologies:
                company.production.production_technologies ||
                prevData.production.productionTechnologies,
              environmentalFriendly:
                company.production.environmental_friendly ||
                prevData.production.environmentalFriendly,
            }
          : prevData.production,
        digital: company.digital
          ? {
              ...prevData.digital,
              currentPlatforms:
                company.digital.current_platforms ||
                prevData.digital.currentPlatforms,
              websiteStatus:
                company.digital.website_status ||
                prevData.digital.websiteStatus,
              ecommerceExperience:
                company.digital.ecommerce_experience ||
                prevData.digital.ecommerceExperience,
              digitalMarketing:
                company.digital.digital_marketing ||
                prevData.digital.digitalMarketing,
              socialMedia:
                company.digital.social_media || prevData.digital.socialMedia,
              onlinePayment:
                company.digital.online_payment ||
                prevData.digital.onlinePayment,
              digitalTools:
                company.digital.digital_tools || prevData.digital.digitalTools,
              techSupport:
                company.digital.tech_support || prevData.digital.techSupport,
              digitalTransformationGoals:
                company.digital.digital_transformation_goals ||
                prevData.digital.digitalTransformationGoals,
              digitalMarketingStrategy:
                company.digital.digital_marketing_strategy ||
                prevData.digital.digitalMarketingStrategy,
            }
          : prevData.digital,
        sales: company.sales
          ? {
              ...prevData.sales,
              salesChannels:
                company.sales.sales_channels || prevData.sales.salesChannels,
              customerSegments:
                company.sales.customer_segments ||
                prevData.sales.customerSegments,
              customerRetention:
                company.sales.customer_retention ||
                prevData.sales.customerRetention,
              salesProcess:
                company.sales.sales_process || prevData.sales.salesProcess,
              crm: company.sales.crm || prevData.sales.crm,
              customerService:
                company.sales.customer_service ||
                prevData.sales.customerService,
              salesTeam: company.sales.sales_team || prevData.sales.salesTeam,
              salesTargets:
                company.sales.sales_targets || prevData.sales.salesTargets,
              salesPerformanceTracking:
                company.sales.sales_performance_tracking ||
                prevData.sales.salesPerformanceTracking,
              customerSatisfactionMeasurement:
                company.sales.customer_satisfaction_measurement ||
                prevData.sales.customerSatisfactionMeasurement,
              salesStrategy:
                company.sales.sales_strategy || prevData.sales.salesStrategy,
            }
          : prevData.sales,
        content: company.content
          ? {
              ...prevData.content,
              brandIdentity:
                company.content.brand_identity ||
                prevData.content.brandIdentity,
              contentStrategy:
                company.content.content_strategy ||
                prevData.content.contentStrategy,
              visualIdentity:
                company.content.visual_identity ||
                prevData.content.visualIdentity,
              marketingMaterials:
                company.content.marketing_materials ||
                prevData.content.marketingMaterials,
              languageSupport:
                company.content.language_support ||
                prevData.content.languageSupport,
              brandPositioning:
                company.content.brand_positioning ||
                prevData.content.brandPositioning,
              communicationChannels:
                company.content.communication_channels ||
                prevData.content.communicationChannels,
              contentCalendar:
                company.content.content_calendar ||
                prevData.content.contentCalendar,
              contentQuality:
                company.content.content_quality ||
                prevData.content.contentQuality,
              targetAudienceAnalysis:
                company.content.target_audience_analysis ||
                prevData.content.targetAudienceAnalysis,
              brandStory:
                company.content.brand_story || prevData.content.brandStory,
            }
          : prevData.content,
        certification: company.production
          ? {
              ...prevData.certification,
              qualityManagement:
                (company.production as any).quality_management ||
                prevData.certification.qualityManagement,
              environmentalCert:
                (company.production as any).environmental_cert ||
                prevData.certification.environmentalCert,
              occupationalSafety:
                (company.production as any).occupational_safety ||
                prevData.certification.occupationalSafety,
              industryAssociations:
                (company.production as any).industry_associations ||
                prevData.certification.industryAssociations,
              chambers:
                (company.production as any).chambers ||
                prevData.certification.chambers,
              exportUnions:
                company.certification.export_unions ||
                prevData.certification.exportUnions,
              governmentSupport:
                company.certification.government_support ||
                prevData.certification.governmentSupport,
              consultingServices:
                company.certification.consulting_services ||
                prevData.certification.consultingServices,
              otherCertifications:
                company.certification.other_certifications ||
                prevData.certification.otherCertifications,
              certificationRenewalDates:
                company.certification.certification_renewal_dates ||
                prevData.certification.certificationRenewalDates,
              certificationGoals:
                company.certification.certification_goals ||
                prevData.certification.certificationGoals,
            }
          : prevData.certification,
      }));
      // Update activity history
      if (company.activityHistory) {
        const mappedHistory = company.activityHistory.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.created_at,
          user: activity.user_id ? 'Admin User' : 'System', // TODO: Get real user name
          details: activity.details,
        }));
        setActivityHistory(mappedHistory);
      }
    }
  }, [company]);
  const [companyStatus, setCompanyStatus] = useState<
    'active' | 'inactive' | 'pending'
  >('pending');
  const [formData, setFormData] = useState<FormData>({
    generalInfo: {
      companyName: '',
      authorizedPerson: '',
      email: '',
      phone: '',
      sector: '',
      city: '',
      address: '',
      website: '',
      foundedYear: '',
      employeeCount: '',
      taxNumber: '',
      legalStructure: 'Anonim Şirket',
      capital: '500000',
      description: '',
    },
    markets: {
      currentMarkets: ['Suudi Arabistan', 'Dubai', 'Sri Lanka', 'Azerbaycan'],
      targetMarkets: ['Kuzey Afrika Ülkeleri', 'Balkan Ülkeleri'],
      exportExperience: '1 yıl',
      exportCountries: ['Sri Lanka'],
      marketResearch:
        'Hedef pazarlarda doğal kumaşlardan (keten, pamuk vs.) butik imalat yapılabilmesi araştırması yapıldı.',
      competitorAnalysis:
        'Müşteri özelinde ÜR-GE çalışmaları ile rekabet avantajı sağlanıyor.',
      marketEntry: ['B2B'],
      distributionChannels: ['B2B', 'E-ticaret', 'Fuar Katılımı'],
    },
    products: {
      mainProducts:
        'Çarşaf, Yastık Kılıfı, Nevresim, Masa Örtüsü, Anne-Bebek Çantası, Dekoratif Kırlent ve Runner',
      productCategories: [
        'Çarşaf',
        'Yastık Kılıfı',
        'Nevresim',
        'Masa Örtüsü',
        'Anne-Bebek Çantası',
        'Dekoratif Kırlent',
        'Runner',
      ],
      productionCapacity: '100 takım/ay',
      qualityCertificates: [
        '%100 pamuklu kumaş',
        '% Pamuk Keten Kumaş',
        '%100 Buldan Bezi',
        '%100 Polycotton',
        'Ranforce',
        'Poplin',
        'Akfil Kumaşlar',
      ],
      productCatalog:
        'Duvet Cover Set: Ethnic Patterned %50 cotton %50 linen, 200×220 cm Duvet Cover, 160×200 cm Fitted Sheet, 50×70 cm Sleeping Pillow, 60×80 cm Decorative Pillow. Pillow and Runner Sets: Ethnic Traditional Hand Print/Stone Print, %100 Linen Cotton Fabric, 45×150 cm Runner - 43×43 cm 2 pillows. Multi-purpose Mother-Baby Bag: 35×50 cm, %100 patterned cotton fabric. Garden Cushions: Special Ethnic Patterned %100 cotton, 6 color pompom Garden Cover and Cushion Set (2 kg Fiber Filled 80×80 cm Cushion). Sequin/Embroidered Room Cover Sets: 150×150 cm polycotton fabric with Ethnic patterned Embroidery and Sequin/Tasseled Tablecloth',
      priceStrategy: '100 takım, 250 adet',
      seasonality: 'Kendi kumaşından çantalar, kutular, PVC poşetler',
      customization: 'Evet',
      dropshipping: 'Olabilir',
    },
    competitors: {
      referenceCompanies: [
        'tivolyohome.com',
        'chakra.com',
        'varoltekstil.com',
        'berthelondon.com',
        'vessino.com',
        'haremlique.com',
        'homepassion.com.tr',
        'adeatekstil.com',
        'icashop.com.tr',
        'ecocotton.com.tr',
      ],
      directCompetitors: ['Ecocotton marka ürünler', 'Chakra', 'Madam Coco'],
      targetPosition: 'IKEA',
      competitiveAdvantages:
        'Müşteri özelinde ÜR-GE çalışmaları ile rekabet avantajı sağlanıyor',
      priceCompetition: 'Orta',
      qualityCompetition: 'Yüksek',
      marketShareTarget: 'Hedef pazarlarda %5-10 pazar payı',
      competitiveStrategy: 'Farklılaştırma stratejisi ile premium segment',
    },
    production: {
      productionFacilities: "İstanbul Tuzla'da 2000 m² üretim tesisi",
      productionCapacity: '10000 adet/ay, 3 vardiya',
      qualityControl: 'Her üründe kalite kontrolü, test laboratuvarı mevcut',
      certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
      supplyChain: 'Yerel ve ithal hammadde tedarikçileri',
      logistics: 'Kendi filosu + kargo şirketleri',
      warehousing: '500 m² depo alanı',
      deliveryTime: '5-10 iş günü',
      productionTechnologies:
        'Modern dikiş makineleri, kesim ekipmanları, kalite kontrol sistemleri',
      environmentalFriendly: 'Evet',
    },
    digital: {
      currentPlatforms: ['Kendi Website'],
      websiteStatus: 'Mevcut ama güncellenme gerekiyor',
      ecommerceExperience: 'Sınırlı, sadece katalog sitesi',
      digitalMarketing: ['Google Ads'],
      socialMedia: ['LinkedIn'],
      onlinePayment: [],
      digitalTools: ['ERP Sistemi'],
      techSupport: 'İç ekip mevcut',
      digitalTransformationGoals:
        'E-ticaret sitesi kurulumu, sosyal medya pazarlaması, online ödeme sistemleri entegrasyonu',
      digitalMarketingStrategy:
        'Hedef kitle analizi ile Google Ads odaklı dijital pazarlama stratejisi',
    },
    sales: {
      salesChannels: ['Doğrudan Satış', 'Distribütör'],
      customerSegments: 'Otomotiv, beyaz eşya, endüstriyel makine üreticileri',
      customerRetention: '%85 müşteri sadakati',
      salesProcess: 'Teklif - Numune - Sipariş - Teslimat',
      crm: 'Excel tabanlı müşteri takibi',
      customerService: 'Telefon ve email desteği',
      salesTeam: '3 kişilik satış ekibi',
      salesTargets: '2024 yılı %30 büyüme hedefi',
      salesPerformanceTracking: 'Aylık raporlama',
      customerSatisfactionMeasurement: 'Müşteri anketleri',
      salesStrategy:
        'Yeni pazarlara açılma, ürün çeşitlendirme, müşteri segmentasyonu ile %30 büyüme hedefi',
    },
    content: {
      brandIdentity: 'Teknoloji ve kalite odaklı marka kimliği',
      contentStrategy: 'Teknik içerik ve ürün tanıtımları',
      visualIdentity: 'Logo ve kurumsal kimlik mevcut',
      marketingMaterials: ['Katalog', 'Broşür', 'Teknik Dökümanlar'],
      languageSupport: ['Türkçe', 'İngilizce'],
      brandPositioning: 'Güvenilir teknoloji partneri',
      communicationChannels: ['Website', 'Email', 'LinkedIn'],
      contentCalendar: 'Aylık içerik planlaması yapılıyor',
      contentQuality: 'Profesyonel',
      targetAudienceAnalysis:
        'Hedef müşteri profilleri analiz edilmiş, teknik içerik odaklı strateji',
      brandStory:
        'Kalite ve güvenilirlik odaklı, müşteri memnuniyeti öncelikli marka hikayesi',
    },
    certification: {
      qualityManagement: 'ISO 9001:2015',
      environmentalCert: 'ISO 14001',
      occupationalSafety: 'OHSAS 18001',
      industryAssociations: ['TESID', 'TESİAD'],
      chambers: ['İstanbul Ticaret Odası'],
      exportUnions: ['İMMİB'],
      governmentSupport: ['KOSGEB', 'TÜBİTAK'],
      consultingServices: ['İhracat Danışmanlığı'],
      otherCertifications: 'CE, RoHS',
      certificationRenewalDates:
        'ISO 9001: 2025-12-31, ISO 14001: 2025-06-30, OHSAS 18001: 2025-03-15',
      certificationGoals:
        'ISO 45001 alınması planlanıyor, İTKİB üyeliği hedefleniyor',
    },
  });
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([
    {
      id: '1',
      name: 'Şirket Faaliyet Belgesi',
      description: 'Güncel faaliyet belgesi (son 3 ay içinde alınmış)',
      fileType: ['PDF', 'JPG', 'PNG'],
      required: true,
      status: 'Yüklendi',
      uploadedAt: '2024-02-15T10:30:00Z',
      fileName: 'faaliyet-belgesi.pdf',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'İhracat Deneyim Belgesi',
      description: 'Daha önce ihracat yapıldıysa deneyim belgeleri',
      fileType: ['PDF', 'DOCX'],
      required: false,
      status: 'Yüklenmedi',
      createdAt: '2024-01-20T14:15:00Z',
    },
    {
      id: '3',
      name: 'Kalite Sertifikaları',
      description: 'ISO 9001, CE, RoHS gibi kalite sertifikaları',
      fileType: ['PDF'],
      required: true,
      status: 'Reddedildi',
      uploadedAt: '2024-02-10T16:20:00Z',
      fileName: 'kalite-sertifikalari.pdf',
      createdAt: '2024-01-25T09:45:00Z',
    },
  ]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([
    {
      id: '1',
      type: 'update',
      title: 'Firma Bilgileri Güncellendi',
      description:
        'Genel bilgiler sekmesinde telefon numarası ve email adresi güncellendi',
      timestamp: '2024-02-20T14:45:00Z',
      user: 'Fatma Özkan',
      details:
        'Telefon: +90 212 555 0123 → +90 212 555 0124, Email: info@firma.com → contact@firma.com',
    },
    {
      id: '2',
      type: 'create',
      title: 'Firma Kaydı Oluşturuldu',
      description: 'Yeni firma kaydı sisteme eklendi',
      timestamp: '2024-02-15T10:30:00Z',
      user: 'Ahmet Yılmaz',
      details: 'Firma adı: 1. firma test-5, Sektör: Tekstil, Şehir: İstanbul',
    },
    {
      id: '3',
      type: 'update',
      title: 'Ürün Bilgileri Güncellendi',
      description:
        'Ürün kategorileri ve üretim kapasitesi bilgileri güncellendi',
      timestamp: '2024-02-12T11:15:00Z',
      user: 'Fatma Özkan',
      details: 'Üretim kapasitesi: 5000 adet/ay → 10000 adet/ay',
    },
    {
      id: '4',
      type: 'note',
      title: 'Müşteri Görüşmesi Notu',
      description: 'Firma yetkilisi ile yapılan görüşme notları',
      timestamp: '2024-02-10T16:20:00Z',
      user: 'Mehmet Demir',
      details:
        'Firma ihracat hedeflerini artırmak istiyor. Yeni pazarlara açılmak için destek talep ediyor.',
    },
  ]);
  const [newNote, setNewNote] = useState<NewNote>({
    title: '',
    description: '',
  });
  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Bilgi Güncelleme',
      section: 'Genel Bilgiler',
      details: 'Telefon numarası güncellendi',
      user: 'Fatma Özkan',
      timestamp: '2024-02-20T14:45:00Z',
    },
    {
      id: '2',
      action: 'Belge Yükleme',
      section: 'Belgeler',
      details: 'Faaliyet belgesi yüklendi',
      user: 'Ahmet Yılmaz',
      timestamp: '2024-02-15T10:30:00Z',
    },
    {
      id: '3',
      action: 'Form Güncelleme',
      section: 'Ürün Bilgileri',
      details: 'Ürün kategorileri güncellendi',
      user: 'Fatma Özkan',
      timestamp: '2024-02-12T11:15:00Z',
    },
  ]);
  const tabs = [
    { id: 'general', name: 'Genel Bilgiler', icon: 'ri-information-line' },
    { id: 'markets', name: 'Mevcut & Hedef Pazarlar', icon: 'ri-global-line' },
    { id: 'products', name: 'Ürün Bilgileri', icon: 'ri-product-hunt-line' },
    {
      id: 'competitors',
      name: 'Rakip ve Referans Firma Algısı',
      icon: 'ri-line-chart-line',
    },
    {
      id: 'production',
      name: 'Üretim ve Lojistik Altyapı',
      icon: 'ri-truck-line',
    },
    {
      id: 'digital',
      name: 'E-Ticaret ve Dijital Varlıklar',
      icon: 'ri-computer-line',
    },
    {
      id: 'sales',
      name: 'Satış & Müşteri Yönetimi',
      icon: 'ri-customer-service-line',
    },
    { id: 'content', name: 'İçerik ve Marka Sunumu', icon: 'ri-palette-line' },
    {
      id: 'certification',
      name: 'DYS ve Birlik Bilgileri',
      icon: 'ri-award-line',
    },
    { id: 'documents', name: 'Belgeler', icon: 'ri-file-list-line' },
    { id: 'logs', name: 'İşlem Geçmişi', icon: 'ri-history-line' },
  ];
  // Form değişikliklerini takip et
  const handleFormChange = (
    section: keyof FormData,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };
  // Sekme değiştirme kontrolü
  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges) {
      setPendingTab(newTab);
      setShowUnsavedWarning(true);
    } else {
      setActiveTab(newTab);
    }
  };
  // Kaydetme işlemi
  const handleSave = async () => {
    try {
      const resolvedParams = await params;
      const companyId = resolvedParams.id;
      // Get the data for the current tab
      let tabData;
      switch (activeTab) {
        case 'general':
          // Map frontend fields to database fields
          tabData = {
            company_name: formData.generalInfo.companyName,
            authorized_person: formData.generalInfo.authorizedPerson,
            email: formData.generalInfo.email,
            phone: formData.generalInfo.phone,
            sector: formData.generalInfo.sector,
            city: formData.generalInfo.city,
            address: formData.generalInfo.address,
            website: formData.generalInfo.website,
            founded_year: formData.generalInfo.foundedYear,
            employee_count: formData.generalInfo.employeeCount,
            tax_number: formData.generalInfo.taxNumber,
            legal_structure: formData.generalInfo.legalStructure,
            capital: formData.generalInfo.capital,
            description: formData.generalInfo.description,
          };
          // Also update company status in companies table
          await fetch(`/api/companies/${companyId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.generalInfo.companyName,
              email: formData.generalInfo.email,
              phone: formData.generalInfo.phone,
              address: formData.generalInfo.address,
              city: formData.generalInfo.city,
              sector: formData.generalInfo.sector,
              website: formData.generalInfo.website,
              description: formData.generalInfo.description,
              status: companyStatus,
            }),
          });
          break;
        case 'markets':
          // Map frontend fields to database fields
          tabData = {
            current_markets: formData.markets.currentMarkets,
            target_markets: formData.markets.targetMarkets,
            export_experience: formData.markets.exportExperience,
            export_countries: formData.markets.exportCountries,
            market_research: formData.markets.marketResearch,
            competitor_analysis: formData.markets.competitorAnalysis,
            market_entry: formData.markets.marketEntry,
            distribution_channels: formData.markets.distributionChannels,
          };
          break;
        case 'products':
          // Map frontend fields to database fields
          tabData = {
            main_products: formData.products.mainProducts,
            product_categories: formData.products.productCategories,
            production_capacity: formData.products.productionCapacity,
            quality_certificates: formData.products.qualityCertificates,
            product_catalog: formData.products.productCatalog,
            price_strategy: formData.products.priceStrategy,
            seasonality: formData.products.seasonality,
            customization: formData.products.customization,
            dropshipping: formData.products.dropshipping,
          };
          break;
        case 'competitors':
          // Map frontend fields to database fields
          tabData = {
            reference_companies: formData.competitors.referenceCompanies,
            direct_competitors: formData.competitors.directCompetitors,
            target_position: formData.competitors.targetPosition,
            competitive_advantages: formData.competitors.competitiveAdvantages,
            price_competition: formData.competitors.priceCompetition,
            quality_competition: formData.competitors.qualityCompetition,
            market_share_target: formData.competitors.marketShareTarget,
            competitive_strategy: formData.competitors.competitiveStrategy,
          };
          break;
        case 'production':
          // Map frontend fields to database fields
          tabData = {
            production_facilities: formData.production.productionFacilities,
            production_capacity: formData.production.productionCapacity,
            quality_control: formData.production.qualityControl,
            certifications: formData.production.certifications,
            supply_chain: formData.production.supplyChain,
            logistics: formData.production.logistics,
            warehousing: formData.production.warehousing,
            delivery_time: formData.production.deliveryTime,
            production_technologies: formData.production.productionTechnologies,
            environmental_friendly: formData.production.environmentalFriendly,
          };
          break;
        case 'digital':
          // Map frontend fields to database fields
          tabData = {
            current_platforms: formData.digital.currentPlatforms,
            website_status: formData.digital.websiteStatus,
            ecommerce_experience: formData.digital.ecommerceExperience,
            digital_marketing: formData.digital.digitalMarketing,
            social_media: formData.digital.socialMedia,
            online_payment: formData.digital.onlinePayment,
            digital_tools: formData.digital.digitalTools,
            tech_support: formData.digital.techSupport,
            digital_transformation_goals:
              formData.digital.digitalTransformationGoals,
            digital_marketing_strategy:
              formData.digital.digitalMarketingStrategy,
          };
          break;
        case 'sales':
          // Map frontend fields to database fields
          tabData = {
            sales_channels: formData.sales.salesChannels,
            customer_segments: formData.sales.customerSegments,
            customer_retention: formData.sales.customerRetention,
            sales_process: formData.sales.salesProcess,
            crm: formData.sales.crm,
            customer_service: formData.sales.customerService,
            sales_team: formData.sales.salesTeam,
            sales_targets: formData.sales.salesTargets,
            sales_performance_tracking: formData.sales.salesPerformanceTracking,
            customer_satisfaction_measurement:
              formData.sales.customerSatisfactionMeasurement,
            sales_strategy: formData.sales.salesStrategy,
          };
          break;
        case 'content':
          // Map frontend fields to database fields
          tabData = {
            brand_identity: formData.content.brandIdentity,
            content_strategy: formData.content.contentStrategy,
            visual_identity: formData.content.visualIdentity,
            marketing_materials: formData.content.marketingMaterials,
            language_support: formData.content.languageSupport,
            brand_positioning: formData.content.brandPositioning,
            communication_channels: formData.content.communicationChannels,
            content_calendar: formData.content.contentCalendar,
            content_quality: formData.content.contentQuality,
            target_audience_analysis: formData.content.targetAudienceAnalysis,
            brand_story: formData.content.brandStory,
          };
          break;
        case 'certification':
          // Map frontend fields to database fields
          tabData = {
            quality_management: formData.certification.qualityManagement,
            environmental_cert: formData.certification.environmentalCert,
            occupational_safety: formData.certification.occupationalSafety,
            industry_associations: formData.certification.industryAssociations,
            chambers: formData.certification.chambers,
            export_unions: formData.certification.exportUnions,
            government_support: formData.certification.governmentSupport,
            consulting_services: formData.certification.consultingServices,
            other_certifications: formData.certification.otherCertifications,
            certification_renewal_dates:
              formData.certification.certificationRenewalDates,
            certification_goals: formData.certification.certificationGoals,
          };
          break;
        default:
          throw new Error('Invalid tab');
      }
      // Send PUT request to update tab data
      const response = await fetch(`/api/companies/${companyId}/tabs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tab: activeTab,
          data: tabData,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save data');
      }
      const result = await response.json();
      setHasUnsavedChanges(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      // Refresh company data after successful save
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (response.ok) {
          const updatedCompany = await response.json();
          setCompany(updatedCompany);
        }
      } catch (error) {}
    } catch (error) {
      alert('Veri kaydedilirken hata oluştu: ' + (error as any).message);
    }
  };
  // Yeni not ekleme
  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.description.trim()) return;
    try {
      const resolvedParams = await params;
      const companyId = resolvedParams.id;
      // Send POST request to add activity note
      const response = await fetch(`/api/companies/${companyId}/tabs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNote.title,
          description: newNote.description,
          details: 'Manuel olarak eklenen not',
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add note');
      }
      const result = await response.json();
      // Add to local state
      const newActivity: ActivityHistory = {
        id: result.data.id,
        type: 'note',
        title: newNote.title,
        description: newNote.description,
        timestamp: result.data.created_at,
        user: 'Admin User', // TODO: Gerçek kullanıcı bilgisi eklenecek
        details: 'Manuel olarak eklenen not',
      };
      setActivityHistory(prev => [newActivity, ...prev]);
      setNewNote({ title: '', description: '' });
    } catch (error) {
      alert('Not eklenirken hata oluştu: ' + (error as any).message);
    }
  };
  // Belge talebi oluşturma
  const handleCreateDocumentRequest = (docData: any) => {
    const newDoc: DocumentRequest = {
      id: Date.now().toString(),
      name: docData.name,
      description: docData.description,
      fileType: docData.fileTypes,
      required: docData.required,
      status: 'Yüklenmedi',
      createdAt: new Date().toISOString(),
    };
    setDocumentRequests(prev => [newDoc, ...prev]);
    setShowDocumentModal(false);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Genel Bilgiler
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Firma Adı <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.generalInfo.companyName}
                  onChange={e =>
                    handleFormChange(
                      'generalInfo',
                      'companyName',
                      e.target.value
                    )
                  }
                  maxLength={100}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Şirket adını giriniz'
                  required
                />
                <p className='text-xs text-gray-500 mt-1'>
                  {formData.generalInfo.companyName.length}/100 karakter
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Firma Durumu <span className='text-red-500'>*</span>
                </label>
                <select
                  value={companyStatus}
                  onChange={e => {
                    setCompanyStatus(
                      e.target.value as 'active' | 'inactive' | 'pending'
                    );
                    setHasUnsavedChanges(true);
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                >
                  <option value='pending'>Beklemede (Tamamlanmadı)</option>
                  <option value='inactive'>Pasif</option>
                  <option value='active'>Aktif (Tamamlandı)</option>
                </select>
                <p className='text-xs text-gray-500 mt-1'>
                  {companyStatus === 'active' &&
                    '✓ Firma kaydı tamamlanmış ve aktif'}
                  {companyStatus === 'pending' && '⏳ Firma kaydı beklemede'}
                  {companyStatus === 'inactive' && '❌ Firma pasif durumda'}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Yetkili Kişi <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.generalInfo.authorizedPerson}
                  onChange={e =>
                    handleFormChange(
                      'generalInfo',
                      'authorizedPerson',
                      e.target.value
                    )
                  }
                  maxLength={50}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Yetkili kişi adı soyadı'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  E-posta <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  value={formData.generalInfo.email}
                  onChange={e =>
                    handleFormChange('generalInfo', 'email', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='ornek@firma.com'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Telefon <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  value={formData.generalInfo.phone}
                  onChange={e =>
                    handleFormChange('generalInfo', 'phone', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='+90 5XX XXX XX XX'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sektör <span className='text-red-500'>*</span>
                </label>
                <select
                  value={formData.generalInfo.sector}
                  onChange={e =>
                    handleFormChange('generalInfo', 'sector', e.target.value)
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                >
                  <option value=''>Sektör seçiniz</option>
                  <option value='Elektronik'>Elektronik</option>
                  <option value='Tekstil'>Tekstil</option>
                  <option value='Makina'>Makina</option>
                  <option value='Gıda'>Gıda</option>
                  <option value='Otomotiv'>Otomotiv</option>
                  <option value='Kimya'>Kimya</option>
                  <option value='İnşaat'>İnşaat</option>
                  <option value='Diğer'>Diğer</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Şehir
                </label>
                <input
                  type='text'
                  value={formData.generalInfo.city}
                  onChange={e =>
                    handleFormChange('generalInfo', 'city', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Şehir adı'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Website
                </label>
                <input
                  type='url'
                  value={formData.generalInfo.website}
                  onChange={e =>
                    handleFormChange('generalInfo', 'website', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='www.ornek.com'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kuruluş Yılı
                </label>
                <input
                  type='number'
                  value={formData.generalInfo.foundedYear}
                  onChange={e =>
                    handleFormChange(
                      'generalInfo',
                      'foundedYear',
                      e.target.value
                    )
                  }
                  min='1900'
                  max={new Date().getFullYear()}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='2020'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Çalışan Sayısı
                </label>
                <select
                  value={formData.generalInfo.employeeCount}
                  onChange={e =>
                    handleFormChange(
                      'generalInfo',
                      'employeeCount',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='1-10'>1-10</option>
                  <option value='11-25'>11-25</option>
                  <option value='25-50'>25-50</option>
                  <option value='51-100'>51-100</option>
                  <option value='100+'>100+</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Vergi Numarası
                </label>
                <input
                  type='text'
                  value={formData.generalInfo.taxNumber}
                  onChange={e =>
                    handleFormChange('generalInfo', 'taxNumber', e.target.value)
                  }
                  maxLength={10}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='1234567890'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Hukuki Yapı
                </label>
                <select
                  value={formData.generalInfo.legalStructure}
                  onChange={e =>
                    handleFormChange(
                      'generalInfo',
                      'legalStructure',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Anonim Şirket'>Anonim Şirket</option>
                  <option value='Limited Şirket'>Limited Şirket</option>
                  <option value='Şahıs Şirketi'>Şahıs Şirketi</option>
                  <option value='Kollektif Şirket'>Kollektif Şirket</option>
                  <option value='Komandit Şirket'>Komandit Şirket</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sermaye (TL)
                </label>
                <input
                  type='number'
                  value={formData.generalInfo.capital}
                  onChange={e =>
                    handleFormChange('generalInfo', 'capital', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='500000'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Adres
              </label>
              <textarea
                rows={3}
                value={formData.generalInfo.address}
                onChange={e =>
                  handleFormChange('generalInfo', 'address', e.target.value)
                }
                maxLength={500}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Detaylı adres bilgisi'
              />
              <p className='text-xs text-gray-500 mt-1'>
                {formData.generalInfo.address.length}/500 karakter
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Firma Açıklaması
              </label>
              <textarea
                rows={4}
                value={formData.generalInfo.description}
                onChange={e =>
                  handleFormChange('generalInfo', 'description', e.target.value)
                }
                maxLength={1000}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Firma hakkında genel bilgiler, faaliyet alanları, vizyonu...'
              />
              <p className='text-xs text-gray-500 mt-1'>
                {formData.generalInfo.description.length}/1000 karakter
              </p>
            </div>
          </div>
        );
      case 'markets':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Mevcut & Hedef Pazarlar
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Mevcut Pazarlar <span className='text-red-500'>*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.markets.currentMarkets.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'markets',
                      'currentMarkets',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Suudi Arabistan, Dubai, Sri Lanka, Azerbaycan'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Virgülle ayırarak ülke adlarını giriniz
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Hedef Pazarlar <span className='text-red-500'>*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.markets.targetMarkets.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'markets',
                      'targetMarkets',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Kuzey Afrika Ülkeleri, Balkan Ülkeleri'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Virgülle ayırarak hedef ülke/region adlarını giriniz
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İhracat Deneyimi
                </label>
                <input
                  type='text'
                  value={formData.markets.exportExperience}
                  onChange={e =>
                    handleFormChange(
                      'markets',
                      'exportExperience',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='5 yıl'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İhracat Yapılan Ülkeler
                </label>
                <textarea
                  rows={2}
                  value={formData.markets.exportCountries.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'markets',
                      'exportCountries',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Almanya, Hollanda, Fransa'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pazar Araştırması
                </label>
                <textarea
                  rows={3}
                  value={formData.markets.marketResearch}
                  onChange={e =>
                    handleFormChange(
                      'markets',
                      'marketResearch',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Hedef pazarlarda yapılan araştırmalar ve bulgular...'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Rakip Analizi
                </label>
                <textarea
                  rows={3}
                  value={formData.markets.competitorAnalysis}
                  onChange={e =>
                    handleFormChange(
                      'markets',
                      'competitorAnalysis',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Ana rakipler ve analiz sonuçları...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pazar Giriş Stratejileri
                </label>
                <div className='space-y-2'>
                  {[
                    'Distribütör Ortaklığı',
                    'Doğrudan Satış',
                    'E-ticaret',
                    'Fuar Katılımı',
                    'Joint Venture',
                    'B2B',
                    'Online Pazaryerleri',
                  ].map(strategy => (
                    <label key={strategy} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.markets.marketEntry.includes(
                          strategy
                        )}
                        onChange={e => {
                          const currentStrategies =
                            formData.markets.marketEntry;
                          const newStrategies = e.target.checked
                            ? [...currentStrategies, strategy]
                            : currentStrategies.filter(s => s !== strategy);
                          handleFormChange(
                            'markets',
                            'marketEntry',
                            newStrategies
                          );
                        }}
                        className='mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <span className='text-sm text-gray-700'>{strategy}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dağıtım Kanalları
                </label>
                <textarea
                  rows={2}
                  value={formData.markets.distributionChannels.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'markets',
                      'distributionChannels',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Distribütör, Online Satış, Fuarlar'
                />
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Ürün Bilgileri
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ana Ürün Grupları <span className='text-red-500'>*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.products.mainProducts}
                  onChange={e =>
                    handleFormChange('products', 'mainProducts', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Çarşaf, Yastık Kılıfı, Nevresim, Masa Örtüsü, Anne-Bebek Çantası, Dekoratif Kırlent ve Runner'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Virgülle ayırarak ana ürün gruplarını giriniz
                </p>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  En Çok Satan Ürünler (Detaylı)
                </label>
                <textarea
                  rows={6}
                  value={formData.products.productCatalog}
                  onChange={e =>
                    handleFormChange(
                      'products',
                      'productCatalog',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Duvet Cover Set: Ethnic Patterned %50 cotton %50 linen, 200×220 cm Duvet Cover, 160×200 cm Fitted Sheet...'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  En çok satan 5-10 ürünün detaylı açıklaması (isim, ölçü,
                  teknik detay, malzeme)
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ürün Kategorileri
                </label>
                <textarea
                  rows={3}
                  value={formData.products.productCategories.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'products',
                      'productCategories',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Çarşaf, Yastık Kılıfı, Nevresim, Masa Örtüsü, Anne-Bebek Çantası, Dekoratif Kırlent, Runner'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Üretim Kapasitesi
                </label>
                <input
                  type='text'
                  value={formData.products.productionCapacity}
                  onChange={e =>
                    handleFormChange(
                      'products',
                      'productionCapacity',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='100 takım/ay'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kullanılan Hammaddeler
                </label>
                <textarea
                  rows={3}
                  value={formData.products.qualityCertificates.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'products',
                      'qualityCertificates',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='%100 pamuklu kumaş, % Pamuk Keten Kumaş, %100 Buldan Bezi, %100 Polycotton, Ranforce, Poplin, Akfil Kumaşlar'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Minimum Sipariş Miktarı (MOQ)
                </label>
                <input
                  type='text'
                  value={formData.products.priceStrategy}
                  onChange={e =>
                    handleFormChange(
                      'products',
                      'priceStrategy',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='100 takım, 250 adet'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ambalaj Şekli ve Ölçüleri
                </label>
                <textarea
                  rows={2}
                  value={formData.products.seasonality}
                  onChange={e =>
                    handleFormChange('products', 'seasonality', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Kendi kumaşından çantalar, kutular, PVC poşetler'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Özel Üretim / Private Label Desteği
                </label>
                <select
                  value={formData.products.customization}
                  onChange={e =>
                    handleFormChange(
                      'products',
                      'customization',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Evet'>Evet</option>
                  <option value='Hayır'>Hayır</option>
                  <option value='Kısmen'>Kısmen</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dropshipping Modeli Uygulanabilir mi?
                </label>
                <select
                  value={formData.products.dropshipping}
                  onChange={e =>
                    handleFormChange('products', 'dropshipping', e.target.value)
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Evet'>Evet</option>
                  <option value='Hayır'>Hayır</option>
                  <option value='Olabilir'>Olabilir</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'competitors':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Rakip ve Referans Firma Algısı
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Örnek Alınan Firmalar (Referans)
                </label>
                <textarea
                  rows={4}
                  value={formData.competitors.referenceCompanies.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'referenceCompanies',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='tivolyohome.com, chakra.com, varoltekstil.com, berthelondon.com, vessino.com, haremlique.com, homepassion.com.tr, adeatekstil.com, icashop.com.tr, ecocotton.com.tr'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Virgülle ayırarak referans aldığınız firmaları giriniz
                </p>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Doğrudan Rakipler
                </label>
                <textarea
                  rows={3}
                  value={formData.competitors.directCompetitors.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'directCompetitors',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Ecocotton marka ürünler, Chakra, Madam Coco'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Aynı pazarda rekabet ettiğiniz firmalar
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Hedef Marka Konumu
                </label>
                <input
                  type='text'
                  value={formData.competitors.targetPosition}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'targetPosition',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='IKEA'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Ulaşmak istediğiniz marka seviyesi
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Rekabet Avantajları
                </label>
                <textarea
                  rows={3}
                  value={formData.competitors.competitiveAdvantages}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'competitiveAdvantages',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Müşteri özelinde ÜR-GE çalışmaları ile rekabet avantajı sağlanıyor'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Fiyat Rekabeti
                </label>
                <select
                  value={formData.competitors.priceCompetition}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'priceCompetition',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Yüksek'>Yüksek</option>
                  <option value='Orta'>Orta</option>
                  <option value='Düşük'>Düşük</option>
                  <option value='Premium'>Premium</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kalite Rekabeti
                </label>
                <select
                  value={formData.competitors.qualityCompetition}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'qualityCompetition',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Yüksek'>Yüksek</option>
                  <option value='Orta'>Orta</option>
                  <option value='Düşük'>Düşük</option>
                  <option value='Premium'>Premium</option>
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pazar Payı Hedefi
                </label>
                <textarea
                  rows={2}
                  value={formData.competitors.marketShareTarget}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'marketShareTarget',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Hedef pazarlarda %5-10 pazar payı'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Rekabet Stratejisi
                </label>
                <textarea
                  rows={3}
                  value={formData.competitors.competitiveStrategy}
                  onChange={e =>
                    handleFormChange(
                      'competitors',
                      'competitiveStrategy',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Farklılaştırma stratejisi ile premium segment'
                />
              </div>
            </div>
          </div>
        );
      case 'production':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Üretim ve Lojistik Altyapı
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Üretim Tesisi ve Konum
                </label>
                <textarea
                  rows={3}
                  value={formData.production.productionFacilities}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'productionFacilities',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder="İstanbul Tuzla'da 2000 m² üretim tesisi"
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Üretim tesisinin konumu, büyüklüğü ve özellikleri
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Üretim Kapasitesi
                </label>
                <textarea
                  rows={2}
                  value={formData.production.productionCapacity}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'productionCapacity',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='10000 adet/ay, 3 vardiya'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Teslimat Süresi
                </label>
                <input
                  type='text'
                  value={formData.production.deliveryTime}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'deliveryTime',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='5-10 iş günü'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kalite Kontrol Süreçleri
                </label>
                <textarea
                  rows={3}
                  value={formData.production.qualityControl}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'qualityControl',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Her üründe kalite kontrolü, test laboratuvarı mevcut'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kalite Sertifikaları
                </label>
                <textarea
                  rows={3}
                  value={formData.production.certifications.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'certifications',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='ISO 9001, ISO 14001, OHSAS 18001'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Depolama Kapasitesi
                </label>
                <input
                  type='text'
                  value={formData.production.warehousing}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'warehousing',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='500 m² depo alanı'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tedarik Zinciri
                </label>
                <textarea
                  rows={2}
                  value={formData.production.supplyChain}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'supplyChain',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Yerel ve ithal hammadde tedarikçileri'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Lojistik ve Dağıtım
                </label>
                <textarea
                  rows={2}
                  value={formData.production.logistics}
                  onChange={e =>
                    handleFormChange('production', 'logistics', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Kendi filosu + kargo şirketleri'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Üretim Teknolojileri
                </label>
                <textarea
                  rows={3}
                  value={formData.production.productionTechnologies}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'productionTechnologies',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Modern dikiş makineleri, kesim ekipmanları'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Çevre Dostu Üretim
                </label>
                <select
                  value={formData.production.environmentalFriendly}
                  onChange={e =>
                    handleFormChange(
                      'production',
                      'environmentalFriendly',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Evet'>Evet</option>
                  <option value='Hayır'>Hayır</option>
                  <option value='Kısmen'>Kısmen</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'digital':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              E-Ticaret ve Dijital Varlıklar
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Mevcut Dijital Platformlar
                </label>
                <textarea
                  rows={3}
                  value={formData.digital.currentPlatforms.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'currentPlatforms',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Kendi Website, Instagram, Facebook'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Virgülle ayırarak kullandığınız platformları giriniz
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Website Durumu
                </label>
                <select
                  value={formData.digital.websiteStatus}
                  onChange={e =>
                    handleFormChange('digital', 'websiteStatus', e.target.value)
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Mevcut ve güncel'>Mevcut ve güncel</option>
                  <option value='Mevcut ama güncellenme gerekiyor'>
                    Mevcut ama güncellenme gerekiyor
                  </option>
                  <option value='Yok, oluşturulması gerekiyor'>
                    Yok, oluşturulması gerekiyor
                  </option>
                  <option value='Eski, yeniden tasarlanması gerekiyor'>
                    Eski, yeniden tasarlanması gerekiyor
                  </option>
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  E-Ticaret Deneyimi
                </label>
                <textarea
                  rows={3}
                  value={formData.digital.ecommerceExperience}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'ecommerceExperience',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Sınırlı, sadece katalog sitesi'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Online satış deneyiminiz ve mevcut durumunuz
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dijital Pazarlama Araçları
                </label>
                <textarea
                  rows={3}
                  value={formData.digital.digitalMarketing.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'digitalMarketing',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Google Ads, Facebook Ads, Instagram Reklamları'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sosyal Medya Hesapları
                </label>
                <textarea
                  rows={3}
                  value={formData.digital.socialMedia.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'socialMedia',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='LinkedIn, Instagram, Facebook, Twitter'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Online Ödeme Sistemleri
                </label>
                <textarea
                  rows={2}
                  value={formData.digital.onlinePayment.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'onlinePayment',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Kredi kartı, banka havalesi, PayPal'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dijital Araçlar ve Sistemler
                </label>
                <textarea
                  rows={3}
                  value={formData.digital.digitalTools.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'digitalTools',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='ERP Sistemi, CRM, Muhasebe Yazılımı'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Teknik Destek
                </label>
                <select
                  value={formData.digital.techSupport}
                  onChange={e =>
                    handleFormChange('digital', 'techSupport', e.target.value)
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='İç ekip mevcut'>İç ekip mevcut</option>
                  <option value='Dışarıdan hizmet alıyor'>
                    Dışarıdan hizmet alıyor
                  </option>
                  <option value='Yok, ihtiyaç var'>Yok, ihtiyaç var</option>
                  <option value='Kısmen mevcut'>Kısmen mevcut</option>
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dijital Dönüşüm Hedefleri
                </label>
                <textarea
                  rows={3}
                  value={formData.digital.digitalTransformationGoals}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'digitalTransformationGoals',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='E-ticaret sitesi kurulumu, sosyal medya pazarlaması, online ödeme sistemleri'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dijital Pazarlama Stratejisi
                </label>
                <textarea
                  rows={3}
                  value={formData.digital.digitalMarketingStrategy}
                  onChange={e =>
                    handleFormChange(
                      'digital',
                      'digitalMarketingStrategy',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Hedef kitle analizi, içerik stratejisi, reklam kampanyaları'
                />
              </div>
            </div>
          </div>
        );
      case 'sales':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Satış & Müşteri Yönetimi
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Satış Kanalları
                </label>
                <textarea
                  rows={3}
                  value={formData.sales.salesChannels.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'sales',
                      'salesChannels',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Doğrudan Satış, Distribütör, E-ticaret'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Virgülle ayırarak kullandığınız satış kanallarını giriniz
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Müşteri Sadakati Oranı
                </label>
                <input
                  type='text'
                  value={formData.sales.customerRetention}
                  onChange={e =>
                    handleFormChange(
                      'sales',
                      'customerRetention',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='%85 müşteri sadakati'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Müşteri Segmentleri
                </label>
                <textarea
                  rows={3}
                  value={formData.sales.customerSegments}
                  onChange={e =>
                    handleFormChange(
                      'sales',
                      'customerSegments',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Otomotiv, beyaz eşya, endüstriyel makine üreticileri'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Hedef müşteri gruplarınız ve sektörleri
                </p>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Satış Süreci
                </label>
                <textarea
                  rows={3}
                  value={formData.sales.salesProcess}
                  onChange={e =>
                    handleFormChange('sales', 'salesProcess', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Teklif - Numune - Sipariş - Teslimat'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Müşteri iletişiminden teslimata kadar olan süreç
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  CRM Sistemi
                </label>
                <select
                  value={formData.sales.crm}
                  onChange={e =>
                    handleFormChange('sales', 'crm', e.target.value)
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Excel tabanlı müşteri takibi'>
                    Excel tabanlı müşteri takibi
                  </option>
                  <option value='Profesyonel CRM yazılımı'>
                    Profesyonel CRM yazılımı
                  </option>
                  <option value='Yok, ihtiyaç var'>Yok, ihtiyaç var</option>
                  <option value='Basit müşteri takip sistemi'>
                    Basit müşteri takip sistemi
                  </option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Satış Ekibi Büyüklüğü
                </label>
                <input
                  type='text'
                  value={formData.sales.salesTeam}
                  onChange={e =>
                    handleFormChange('sales', 'salesTeam', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='3 kişilik satış ekibi'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Müşteri Hizmetleri
                </label>
                <textarea
                  rows={2}
                  value={formData.sales.customerService}
                  onChange={e =>
                    handleFormChange('sales', 'customerService', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Telefon ve email desteği'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Satış Hedefleri
                </label>
                <textarea
                  rows={2}
                  value={formData.sales.salesTargets}
                  onChange={e =>
                    handleFormChange('sales', 'salesTargets', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='2024 yılı %30 büyüme hedefi'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Satış Performans Takibi
                </label>
                <select
                  value={formData.sales.salesPerformanceTracking}
                  onChange={e =>
                    handleFormChange(
                      'sales',
                      'salesPerformanceTracking',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Aylık raporlama'>Aylık raporlama</option>
                  <option value='Haftalık takip'>Haftalık takip</option>
                  <option value='Günlük takip'>Günlük takip</option>
                  <option value='Yok'>Yok</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Müşteri Memnuniyet Ölçümü
                </label>
                <select
                  value={formData.sales.customerSatisfactionMeasurement}
                  onChange={e =>
                    handleFormChange(
                      'sales',
                      'customerSatisfactionMeasurement',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Müşteri anketleri'>Müşteri anketleri</option>
                  <option value='Geri bildirim formları'>
                    Geri bildirim formları
                  </option>
                  <option value='Sosyal medya takibi'>
                    Sosyal medya takibi
                  </option>
                  <option value='Yok'>Yok</option>
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Satış Stratejisi ve Planları
                </label>
                <textarea
                  rows={3}
                  value={formData.sales.salesStrategy}
                  onChange={e =>
                    handleFormChange('sales', 'salesStrategy', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Yeni pazarlara açılma, ürün çeşitlendirme, müşteri segmentasyonu'
                />
              </div>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              İçerik ve Marka Sunumu
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Marka Kimliği ve Değerler
                </label>
                <textarea
                  rows={3}
                  value={formData.content.brandIdentity}
                  onChange={e =>
                    handleFormChange('content', 'brandIdentity', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Teknoloji ve kalite odaklı marka kimliği'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Markanızın temel değerleri ve kimlik özellikleri
                </p>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İçerik Stratejisi
                </label>
                <textarea
                  rows={3}
                  value={formData.content.contentStrategy}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'contentStrategy',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Teknik içerik ve ürün tanıtımları'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  İçerik üretim ve yayınlama stratejiniz
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Görsel Kimlik Durumu
                </label>
                <select
                  value={formData.content.visualIdentity}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'visualIdentity',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Logo ve kurumsal kimlik mevcut'>
                    Logo ve kurumsal kimlik mevcut
                  </option>
                  <option value='Logo var, kurumsal kimlik eksik'>
                    Logo var, kurumsal kimlik eksik
                  </option>
                  <option value='Yok, oluşturulması gerekiyor'>
                    Yok, oluşturulması gerekiyor
                  </option>
                  <option value='Güncellenmesi gerekiyor'>
                    Güncellenmesi gerekiyor
                  </option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Marka Konumlandırması
                </label>
                <input
                  type='text'
                  value={formData.content.brandPositioning}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'brandPositioning',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Güvenilir teknoloji partneri'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pazarlama Materyalleri
                </label>
                <textarea
                  rows={3}
                  value={formData.content.marketingMaterials.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'marketingMaterials',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Katalog, Broşür, Teknik Dökümanlar'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dil Desteği
                </label>
                <textarea
                  rows={2}
                  value={formData.content.languageSupport.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'languageSupport',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Türkçe, İngilizce, Almanca'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İletişim Kanalları
                </label>
                <textarea
                  rows={2}
                  value={formData.content.communicationChannels.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'communicationChannels',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Website, Email, LinkedIn, Sosyal Medya'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İçerik Takvimi
                </label>
                <select
                  value={formData.content.contentCalendar}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'contentCalendar',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Aylık içerik planlaması yapılıyor'>
                    Aylık içerik planlaması yapılıyor
                  </option>
                  <option value='Haftalık planlama'>Haftalık planlama</option>
                  <option value='Günlük planlama'>Günlük planlama</option>
                  <option value='Planlama yok'>Planlama yok</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İçerik Kalitesi
                </label>
                <select
                  value={formData.content.contentQuality}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'contentQuality',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='Profesyonel'>Profesyonel</option>
                  <option value='Orta'>Orta</option>
                  <option value='Temel'>Temel</option>
                  <option value='Geliştirilmesi gerekiyor'>
                    Geliştirilmesi gerekiyor
                  </option>
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Hedef Kitle Analizi
                </label>
                <textarea
                  rows={3}
                  value={formData.content.targetAudienceAnalysis}
                  onChange={e =>
                    handleFormChange(
                      'content',
                      'targetAudienceAnalysis',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Hedef müşteri profilleri, ihtiyaçları ve tercihleri'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Marka Hikayesi
                </label>
                <textarea
                  rows={4}
                  value={formData.content.brandStory}
                  onChange={e =>
                    handleFormChange('content', 'brandStory', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Firmanızın kuruluş hikayesi, misyonu ve vizyonu'
                />
              </div>
            </div>
          </div>
        );
      case 'certification':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              DYS ve Birlik Bilgileri
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kalite Yönetim Sistemi
                </label>
                <select
                  value={formData.certification.qualityManagement}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'qualityManagement',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='ISO 9001:2015'>ISO 9001:2015</option>
                  <option value='ISO 9001:2008'>ISO 9001:2008</option>
                  <option value='Yok'>Yok</option>
                  <option value='Alınması planlanıyor'>
                    Alınması planlanıyor
                  </option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Çevre Yönetim Sistemi
                </label>
                <select
                  value={formData.certification.environmentalCert}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'environmentalCert',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='ISO 14001'>ISO 14001</option>
                  <option value='Yok'>Yok</option>
                  <option value='Alınması planlanıyor'>
                    Alınması planlanıyor
                  </option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İş Sağlığı Güvenliği
                </label>
                <select
                  value={formData.certification.occupationalSafety}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'occupationalSafety',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Seçiniz</option>
                  <option value='OHSAS 18001'>OHSAS 18001</option>
                  <option value='ISO 45001'>ISO 45001</option>
                  <option value='Yok'>Yok</option>
                  <option value='Alınması planlanıyor'>
                    Alınması planlanıyor
                  </option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Diğer Sertifikalar
                </label>
                <textarea
                  rows={2}
                  value={formData.certification.otherCertifications}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'otherCertifications',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='CE, RoHS, Halal, Kosher vb.'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sektör Birlikleri
                </label>
                <textarea
                  rows={3}
                  value={formData.certification.industryAssociations.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'industryAssociations',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='TESID, TESİAD, İTKİB'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ticaret Odaları
                </label>
                <textarea
                  rows={2}
                  value={formData.certification.chambers.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'chambers',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='İstanbul Ticaret Odası'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İhracat Birlikleri
                </label>
                <textarea
                  rows={2}
                  value={formData.certification.exportUnions.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'exportUnions',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='İMMİB, İTKİB'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Devlet Desteği Programları
                </label>
                <textarea
                  rows={3}
                  value={formData.certification.governmentSupport.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'governmentSupport',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='KOSGEB, TÜBİTAK, İhracat Destekleri'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Danışmanlık Hizmetleri
                </label>
                <textarea
                  rows={3}
                  value={formData.certification.consultingServices.join(', ')}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'consultingServices',
                      e.target.value.split(', ').filter(item => item.trim())
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='İhracat Danışmanlığı, Kalite Danışmanlığı'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sertifika Yenileme Tarihleri
                </label>
                <textarea
                  rows={2}
                  value={formData.certification.certificationRenewalDates}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'certificationRenewalDates',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='ISO 9001: 2025-12-31, ISO 14001: 2025-06-30'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sertifika ve Birlik Üyelik Hedefleri
                </label>
                <textarea
                  rows={3}
                  value={formData.certification.certificationGoals}
                  onChange={e =>
                    handleFormChange(
                      'certification',
                      'certificationGoals',
                      e.target.value
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Alınması planlanan sertifikalar ve katılınması hedeflenen birlikler'
                />
              </div>
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className='space-y-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              İşlem Geçmişi
            </h3>
            <div className='bg-white rounded-lg border border-gray-200'>
              <div className='p-6'>
                <div className='space-y-4'>
                  {activityHistory.map((activity, index) => (
                    <div
                      key={activity.id}
                      className='flex items-start space-x-4 p-4 bg-gray-50 rounded-lg'
                    >
                      <div className='flex-shrink-0'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            activity.type === 'update'
                              ? 'bg-blue-500'
                              : activity.type === 'create'
                                ? 'bg-green-500'
                                : activity.type === 'delete'
                                  ? 'bg-red-500'
                                  : activity.type === 'note'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-500'
                          }`}
                        ></div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium text-gray-900'>
                            {activity.title}
                          </p>
                          <span className='text-xs text-gray-500'>
                            {new Date(activity.timestamp).toLocaleString(
                              'tr-TR'
                            )}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>
                          {activity.description}
                        </p>
                        {activity.user && (
                          <p className='text-xs text-gray-500 mt-1'>
                            İşlemi yapan: {activity.user}
                          </p>
                        )}
                        {activity.details && (
                          <div className='mt-2 p-2 bg-white rounded border text-xs text-gray-700'>
                            <strong>Detaylar:</strong> {activity.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {activityHistory.length === 0 && (
                  <div className='text-center py-8'>
                    <div className='text-gray-400 mb-2'>
                      <svg
                        className='mx-auto h-12 w-12'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>
                    <p className='text-gray-500'>
                      Henüz işlem geçmişi bulunmuyor
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Yeni Not Ekleme */}
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                Yeni Not Ekle
              </h4>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Not Başlığı
                  </label>
                  <input
                    type='text'
                    value={newNote.title}
                    onChange={e =>
                      setNewNote({ ...newNote, title: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Örn: Firma bilgileri güncellendi'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Not Açıklaması
                  </label>
                  <textarea
                    rows={3}
                    value={newNote.description}
                    onChange={e =>
                      setNewNote({ ...newNote, description: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Yapılan değişikliklerin detayları...'
                  />
                </div>
                <div className='flex justify-end'>
                  <button
                    onClick={handleAddNote}
                    disabled={
                      !newNote.title.trim() || !newNote.description.trim()
                    }
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                  >
                    Not Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      // ... existing code for other cases ...
      default:
        return (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-settings-line text-2xl text-gray-400'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Bu sekme henüz geliştirilmekte
            </h3>
            <p className='text-gray-500'>
              Yakında bu bölüm için formlar eklenecektir
            </p>
          </div>
        );
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Firma verileri yükleniyor...</p>
        </div>
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-2xl text-red-600'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Link
            href='/admin/firma-yonetimi'
            className='bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors'
          >
            Firma Listesine Dön
          </Link>
        </div>
      </div>
    );
  }
  // Company not found
  if (!company) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-building-line text-2xl text-gray-400'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Firma Bulunamadı
          </h3>
          <p className='text-gray-600 mb-4'>
            Aradığınız firma bulunamadı veya silinmiş olabilir.
          </p>
          <Link
            href='/admin/firma-yonetimi'
            className='bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors'
          >
            Firma Listesine Dön
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer'
              >
                <i className='ri-menu-line text-lg text-gray-600'></i>
              </button>
              <Link href='/' className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-global-line text-white text-lg w-5 h-5 flex items-center justify-center'></i>
                </div>
                <div className='flex flex-col'>
                  <span className="font-[\'Pacifico\'] text-xl text-blue-900 leading-tight">
                    İhracat Akademi
                  </span>
                  <span className='text-xs text-gray-500 font-medium'>
                    Admin Panel
                  </span>
                </div>
              </Link>
              <nav className='flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin/firma-yonetimi'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Firma Yönetimi
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>
                  {company?.name || 'Firma'}
                </span>
              </nav>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-8 h-8 flex items-center justify-center'>
                <i className='ri-notification-3-line text-gray-600 text-xl cursor-pointer hover:text-gray-900'></i>
              </div>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-medium'>AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-16 h-full z-30 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <nav className='p-2 space-y-1'>
          <Link href='/admin'>
            <MenuItem
              icon='ri-dashboard-line'
              title='Panel Ana Sayfası'
              isActive={activeMenuItem === 'dashboard'}
              onClick={() => setActiveMenuItem('dashboard')}
            />
          </Link>
          <Link href='/admin/proje-yonetimi'>
            <MenuItem
              icon='ri-folder-line'
              title='Proje Yönetimi'
              isActive={activeMenuItem === 'projects'}
              onClick={() => setActiveMenuItem('projects')}
            />
          </Link>
          <Link href='/admin/etkinlik-yonetimi'>
            <MenuItem
              icon='ri-calendar-event-line'
              title='Etkinlik Yönetimi'
              isActive={activeMenuItem === 'events'}
              onClick={() => setActiveMenuItem('events')}
            />
          </Link>
          <MenuItem
            icon='ri-graduation-cap-line'
            title='Eğitim Yönetimi'
            isActive={activeMenuItem === 'education'}
            onClick={() => {
              setActiveMenuItem('education');
              setEducationExpanded(!educationExpanded);
            }}
            hasSubMenu={true}
            isExpanded={educationExpanded}
          />
          {educationExpanded && !sidebarCollapsed && (
            <div className='ml-2 space-y-1'>
              <Link href='/admin/egitim-yonetimi/videolar'>
                <SubMenuItem
                  title='Videolar'
                  isActive={activeMenuItem === 'education-videos'}
                  onClick={() => setActiveMenuItem('education-videos')}
                />
              </Link>
              <Link href='/admin/egitim-yonetimi/setler'>
                <SubMenuItem
                  title='Eğitim Setleri'
                  isActive={activeMenuItem === 'education-sets'}
                  onClick={() => setActiveMenuItem('education-sets')}
                />
              </Link>
              <Link href='/admin/egitim-yonetimi/firma-takip'>
                <SubMenuItem
                  title='Firma Takip'
                  isActive={activeMenuItem === 'company-tracking'}
                  onClick={() => setActiveMenuItem('company-tracking')}
                />
              </Link>
              <Link href='/admin/egitim-yonetimi/dokumanlar'>
                <SubMenuItem
                  title='Dökümanlar'
                  isActive={activeMenuItem === 'education-docs'}
                  onClick={() => setActiveMenuItem('education-docs')}
                />
              </Link>
            </div>
          )}
          <MenuItem
            icon='ri-building-line'
            title='Firma Yönetimi'
            isActive={activeMenuItem === 'company-management'}
            onClick={() => setActiveMenuItem('company-management')}
          />
          <Link href='/admin/kariyer-portali'>
            <MenuItem
              icon='ri-briefcase-line'
              title='Kariyer Portalı'
              isActive={activeMenuItem === 'career-portal'}
              onClick={() => setActiveMenuItem('career-portal')}
            />
          </Link>
          <Link href='/admin/randevu-talepleri'>
            <MenuItem
              icon='ri-calendar-check-line'
              title='Randevu Talepleri'
              isActive={activeMenuItem === 'appointments'}
              onClick={() => setActiveMenuItem('appointments')}
            />
          </Link>
        </nav>
      </div>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden'
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <div className='px-4 sm:px-6 lg:px-8 py-8'>
          {/* Company Header */}
          <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-6 mb-8'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-2xl font-bold mb-2'>{company.name}</h1>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-blue-100'>
                  <div>
                    <div className='text-sm opacity-80'>Yetkili Kişi</div>
                    <div className='font-medium'>
                      {company.authorizedPerson}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm opacity-80'>Sektör</div>
                    <div className='font-medium'>{company.sector}</div>
                  </div>
                  <div>
                    <div className='text-sm opacity-80'>Danışman</div>
                    <div className='font-medium'>{company.consultant}</div>
                  </div>
                  <div>
                    <div className='text-sm opacity-80'>Proje Durumu</div>
                    <div className='font-medium'>{company.projectStatus}</div>
                  </div>
                </div>
              </div>
              <Link href='/admin/firma-yonetimi'>
                <button className='bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap'>
                  Geri Dön
                </button>
              </Link>
            </div>
          </div>
          {/* Success Message */}
          {showSuccessMessage && (
            <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2'>
              <i className='ri-check-line'></i>
              <span>Güncelleme başarılı!</span>
            </div>
          )}
          {/* Tab Navigation */}
          <div className='mb-6'>
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  icon={tab.icon}
                >
                  {tab.name}
                </TabButton>
              ))}
            </div>
          </div>
          {/* Tab Content */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            {renderTabContent()}
            {/* Save Button and Consultant Note Section (appears in all tabs except logs) */}
            {activeTab !== 'logs' && (
              <div className='mt-8 pt-6 border-t border-gray-200 space-y-6'>
                {/* Save Button */}
                <div className='flex justify-end'>
                  <button
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      hasUnsavedChanges
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
                {/* Consultant Note Section */}
                <div>
                  <h4 className='text-lg font-medium text-gray-900 mb-4'>
                    Danışman Notu
                  </h4>
                  <textarea
                    rows={3}
                    value={consultantNote}
                    onChange={e => setConsultantNote(e.target.value)}
                    maxLength={1000}
                    placeholder='Bu sekme hakkında danışman yorumunuzu yazın...'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <div className='flex justify-between items-center mt-2'>
                    <p className='text-xs text-gray-500'>
                      {consultantNote.length}/1000 karakter
                    </p>
                    <div className='text-sm text-gray-500'>
                      Son Güncelleme:{' '}
                      {company.lastUpdate
                        ? new Date(company.lastUpdate).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Bilinmiyor'}{' '}
                      - {company.consultant || 'Atanmamış'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md'>
            <div className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center'>
                  <i className='ri-alert-line text-yellow-600 text-xl'></i>
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Kaydedilmemiş Değişiklikler
                </h3>
              </div>
              <p className='text-gray-600 mb-6'>
                Bu sekmede kaydedilmemiş değişiklikleriniz var. Sekmeyi
                değiştirmek istediğinizden emin misiniz?
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => {
                    setShowUnsavedWarning(false);
                    setPendingTab('');
                  }}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer whitespace-nowrap'
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    setHasUnsavedChanges(false);
                    setActiveTab(pendingTab);
                    setShowUnsavedWarning(false);
                    setPendingTab('');
                  }}
                  className='bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap'
                >
                  Değişiklikleri Kaybet
                </button>
                <button
                  onClick={() => {
                    handleSave();
                    setActiveTab(pendingTab);
                    setShowUnsavedWarning(false);
                    setPendingTab('');
                  }}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap'
                >
                  Kaydet ve Devam Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
