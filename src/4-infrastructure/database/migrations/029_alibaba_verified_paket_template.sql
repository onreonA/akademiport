-- ============================================================================
-- ALİBABA VERIFIED PAKET KURULUMU - PROJE ŞABLONU
-- ============================================================================
-- Bu migration, Alibaba Verified Paket Kurulumu için detaylı bir proje şablonu oluşturur
-- ============================================================================

-- Ana Proje: Alibaba Verified Paket Kurulumu ve Yönetimi
INSERT INTO projects (
  id,
  company_id,
  consultant_id,
  name,
  description,
  status,
  priority,
  start_date,
  end_date,
  progress,
  is_template,
  template_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,
  NULL,
  'Alibaba Verified Paket Kurulumu ve Yönetimi',
  'Bu proje, firmaların Alibaba.com üzerinde Verified Supplier statüsü kazanması ve aktif B2B satış yapabilir hale getirilmesi için kapsamlı bir danışmanlık sürecidir. Proje, hesap kurulumundan başlayarak mağaza tasarımı, ürün yönetimi, reklam kampanyaları ve sürekli optimizasyon süreçlerini içermektedir. SGS/Bureau Veritas tarafından yapılan firma doğrulama (BV) işlemi de bu sürecin kritik bir parçasıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  0,
  true,
  NULL,
  NOW(),
  NOW()
);

-- ALT PROJE 1: ÖN HAZIRLIK VE DOKÜMANTASYON
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Ön Hazırlık ve Dokümantasyon',
  'Bu aşama, Alibaba Verified Paket başvurusu için gerekli tüm dokümantasyon ve hazırlıkların yapıldığı kritik bir süreçtir. Firmaların tüm yasal belgeleri, şirket bilgileri, ürün portföyü ve görselleri bu aşamada toplanır ve Alibaba standartlarına uygun hale getirilir. İyi bir hazırlık, sonraki aşamalarda yaşanabilecek gecikmeleri önler ve sürecin hızlı ilerlemesini sağlar.',
  'todo',
  1,
  0,
  NOW(),
  NOW()
);

-- Görev 1.1: Şirket Belgelerinin Toplanması
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '11000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  NULL,
  'Şirket Belgelerinin Toplanması',
  'Bu görev, Alibaba Verified Paket başvurusu için gerekli tüm yasal ve ticari belgelerin toplanmasını içerir. Belgelerin güncel olması ve Alibaba standartlarına uygun formatta hazırlanması kritik öneme sahiptir. Eksik veya yanlış belgeler, başvuru sürecinde gecikmelere neden olabilir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 1.2: Şirket Bilgilerinin İngilizce Çevirisi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '11000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  NULL,
  'Şirket Bilgilerinin İngilizce Çevirisi',
  'Alibaba.com uluslararası bir platform olduğu için tüm içerikler İngilizce olmalıdır. Bu görev, şirket bilgilerinin profesyonel bir şekilde İngilizce''ye çevrilmesini içerir. Çevirilerin yeminli tercüman tarafından yapılması ve noter onayı alınması önerilir. Özellikle yasal belgeler için bu zorunludur.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 1.3: Ürün Portföyünün Belirlenmesi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '11000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  NULL,
  'Ürün Portföyünün Belirlenmesi',
  'Bu görev, Alibaba.com''da satılacak ürünlerin belirlenmesi ve her ürün için fiyatlandırma, teslimat, ödeme koşulları gibi kritik bilgilerin hazırlanmasını içerir. Ürün portföyü stratejik olarak belirlenmeli ve en güçlü ürünler önceliklendirilmelidir. Fiyatlandırma rekabetçi olmalı ancak kar marjı korunmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 1.4: Ürün Fotoğraflarının Hazırlanması
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '11000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  NULL,
  'Ürün Fotoğraflarının Hazırlanması',
  'Alibaba.com''da ürün fotoğrafları satışı doğrudan etkileyen en önemli faktörlerden biridir. Profesyonel, yüksek kaliteli fotoğraflar müşteri güvenini artırır ve satış oranını yükseltir. Bu görev, tüm ürünler için çoklu açı fotoğrafları, kullanım alanı fotoğrafları ve paketleme fotoğraflarının çekilmesini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- Görev 1.5: Şirket Video Çekimi Hazırlığı
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '11000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000001',
  NULL,
  'Şirket Video Çekimi Hazırlığı',
  'Alibaba.com''da şirket tanıtım videosu, müşteri güvenini artıran ve satışı destekleyen önemli bir araçtır. Video, şirketin üretim kapasitesi, kalite kontrol süreçleri ve güvenilirliğini göstermelidir. Bu görev, video çekimi için gerekli tüm hazırlıkların yapılmasını içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  5,
  NOW(),
  NOW()
);

-- ALT PROJE 2: HESAP OLUŞTURMA VE TEMEL KURULUM
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Hesap Oluşturma ve Temel Kurulum',
  'Bu aşama, Alibaba.com''da temel hesap oluşturma ve profil bilgilerinin doldurulması sürecidir. İlk ürünlerin yüklenmesi de bu aşamada yapılır. Profil bilgilerinin %100 tamamlanması, Alibaba algoritması tarafından daha iyi değerlendirilmesini sağlar ve organik trafik artışına katkıda bulunur.',
  'todo',
  2,
  0,
  NOW(),
  NOW()
);

-- Görev 2.1: Alibaba.com Üyelik Başvurusu
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '12000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  NULL,
  'Alibaba.com Üyelik Başvurusu',
  'Bu görev, Alibaba.com''da temel supplier hesabı oluşturma sürecidir. Hesap oluşturulurken dikkat edilmesi gereken en önemli nokta, şirket domain''ine ait bir e-posta adresi kullanılmasıdır. Gmail, Yahoo gibi ücretsiz e-posta servisleri Alibaba tarafından daha az güvenilir kabul edilir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 2.2: Temel Profil Bilgilerinin Doldurulması
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '12000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  NULL,
  'Temel Profil Bilgilerinin Doldurulması',
  'Alibaba.com profil bilgilerinin %100 tamamlanması, platformun arama algoritmasında daha üst sıralarda yer almayı sağlar. Bu görev, şirket logosu, cover photo, sosyal medya hesapları gibi tüm profil bilgilerinin eksiksiz doldurulmasını içerir. Her bilgi, SEO açısından optimize edilmiş olmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 2.3: İlk Ürün Yükleme (Test)
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '12000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000002',
  NULL,
  'İlk Ürün Yükleme (Test)',
  'Bu görev, Alibaba.com''a ilk ürünlerin yüklenmesi ve sistemin test edilmesi sürecidir. 5-10 adet pilot ürün seçilerek yüklenir. Bu ürünler, firmanın en güçlü ve en çok satılan ürünleri olmalıdır. Ürün açıklamaları detaylı, SEO uyumlu ve müşteri odaklı olmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- ALT PROJE 3: ALİBABA VERIFIED PAKET BAŞVURUSU VE ONAY
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Alibaba Verified Paket Başvurusu ve Onay',
  'Bu aşama, Alibaba Verified Paket başvurusu ve onay sürecidir. Bu süreç, belge doğrulama, SGS/Bureau Veritas tarafından yapılan firma doğrulama (BV) ve şirket video çekimi gibi kritik adımları içerir. Bu aşamanın tamamlanması, firmaların Alibaba.com''da "Verified" badge''i almasını sağlar ve müşteri güvenini önemli ölçüde artırır.',
  'todo',
  3,
  0,
  NOW(),
  NOW()
);

-- Görev 3.1: Alibaba Verified Paket Seçimi ve Başvuru
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '13000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  NULL,
  'Alibaba Verified Paket Seçimi ve Başvuru',
  'Alibaba''nın farklı Verified Paket seçenekleri vardır. Bu görev, firmanın ihtiyacına uygun paketin seçilmesi, sözleşme imzalama ve ödeme işlemlerinin tamamlanmasını içerir. Paket seçimi, firmanın bütçesi ve hedeflerine göre yapılmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 3.2: Belge Doğrulama Süreci
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '13000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  NULL,
  'Belge Doğrulama Süreci',
  'Alibaba, Verified Paket başvurusu için çeşitli yasal belgelerin doğrulanmasını ister. Bu görev, tüm belgelerin Alibaba portalına yüklenmesi, eksikliklerin giderilmesi ve onay sürecinin tamamlanmasını içerir. Belgelerin İngilizce çevirileri de yüklenmelidir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 3.3: SGS/BV Firma Doğrulama (Business Verification)
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '13000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  NULL,
  'SGS/BV Firma Doğrulama (Business Verification)',
  'SGS (Société Générale de Surveillance) veya Bureau Veritas (BV) tarafından yapılan firma doğrulama (BV), Alibaba Verified Paket sürecinin en kritik aşamasıdır. Bu görev, denetim ekibinin firmayı ziyaret etmesi, üretim tesislerini, kalite kontrol süreçlerini ve yasal belgeleri incelemesi sürecini içerir. Denetim sonucunda hazırlanan rapor, Alibaba''ya iletilir ve Verified statüsünün alınmasında belirleyicidir.',
  'todo',
  'urgent',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 3.4: Video Çekimi ve Onayı
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '13000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000003',
  NULL,
  'Video Çekimi ve Onayı',
  'Alibaba.com''da şirket tanıtım videosu, müşteri güvenini artıran ve satışı destekleyen önemli bir araçtır. Video, şirketin üretim kapasitesi, kalite kontrol süreçleri ve güvenilirliğini göstermelidir. Bu görev, profesyonel video çekimi, düzenleme ve Alibaba''ya yükleme sürecini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- ALT PROJE 4: MAĞAZA KURULUMU VE TASARIM
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Mağaza Kurulumu ve Tasarım',
  'Alibaba.com''da mağaza (storefront) tasarımı, firmanın dijital vitrini niteliğindedir. Profesyonel ve çekici bir mağaza tasarımı, müşteri güvenini artırır ve satış oranını yükseltir. Bu aşama, banner tasarımı, kategori yapısı, SEO optimizasyonu ve içerik oluşturma süreçlerini içerir.',
  'todo',
  4,
  0,
  NOW(),
  NOW()
);

-- Görev 4.1: Storefront (Mini Site) Tasarımı
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '14000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  NULL,
  'Storefront (Mini Site) Tasarımı',
  'Bu görev, Alibaba mağaza sayfasının görsel tasarımını içerir. Banner''lar, renk paleti, font seçimi ve sayfa düzenleri bu görev kapsamında yapılır. Tasarım, firmanın kurumsal kimliğine uygun olmalı ve mobil cihazlarda da mükemmel görünmelidir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 4.2: Kategori Yapısının Oluşturulması
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '14000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  NULL,
  'Kategori Yapısının Oluşturulması',
  'Alibaba.com''da ürün kategorilerinin doğru yapılandırılması, müşterilerin ürünleri kolayca bulmasını sağlar. Bu görev, ana kategorilerin belirlenmesi, alt kategorilerin oluşturulması ve kategori açıklamalarının yazılmasını içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 4.3: Mağaza İçeriği Oluşturma
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '14000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  NULL,
  'Mağaza İçeriği Oluşturma',
  'Alibaba.com mağaza sayfasındaki içerikler, firmanın güvenilirliğini ve profesyonelliğini göstermelidir. Bu görev, şirket tanıtımı, üretim kapasitesi, kalite kontrol süreçleri gibi detaylı içeriklerin hazırlanmasını içerir. İçerikler SEO uyumlu ve müşteri odaklı olmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 4.4: SEO Optimizasyonu
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '14000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000004',
  NULL,
  'SEO Optimizasyonu',
  'Alibaba.com''da SEO optimizasyonu, organik trafik artışı için kritik öneme sahiptir. Bu görev, anahtar kelime araştırması, meta açıklamaları, URL yapısı ve içerik optimizasyonu süreçlerini içerir. SEO çalışması, sürekli takip ve güncelleme gerektirir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- ALT PROJE 5: ÜRÜN YÖNETİMİ
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Ürün Yönetimi',
  'Bu aşama, Alibaba.com''da tüm ürünlerin yüklenmesi, optimize edilmesi ve stok yönetiminin kurulması sürecidir. Ürün yönetimi, Alibaba.com''da satış başarısının temelidir. Her ürün için detaylı açıklamalar, yüksek kaliteli fotoğraflar ve rekabetçi fiyatlar hazırlanmalıdır.',
  'todo',
  5,
  0,
  NOW(),
  NOW()
);

-- Görev 5.1: Toplu Ürün Yükleme
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '15000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000005',
  NULL,
  'Toplu Ürün Yükleme',
  'Bu görev, Alibaba.com''a tüm ürünlerin toplu olarak yüklenmesi sürecidir. Alibaba''nın bulk upload özelliği kullanılarak, Excel şablonu ile tüm ürünler tek seferde yüklenebilir. Bu yöntem, zaman tasarrufu sağlar ve tutarlılığı garanti eder.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 5.2: Ürün Açıklamalarının Optimizasyonu
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '15000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000005',
  NULL,
  'Ürün Açıklamalarının Optimizasyonu',
  'Alibaba.com''da ürün açıklamaları, satış oranını doğrudan etkileyen önemli bir faktördür. Bu görev, her ürün için detaylı, SEO uyumlu ve müşteri odaklı açıklamaların yazılmasını içerir. Açıklamalar, ürün özelliklerini, avantajlarını ve kullanım alanlarını kapsamalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 5.3: Ürün Fiyatlandırma Stratejisi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '15000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000005',
  NULL,
  'Ürün Fiyatlandırma Stratejisi',
  'Alibaba.com''da fiyatlandırma stratejisi, satış başarısının kritik bir parçasıdır. Bu görev, rakip analizi, maliyet hesaplaması ve kar marjı belirleme süreçlerini içerir. Fiyatlar, rekabetçi olmalı ancak kar marjı korunmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 5.4: Stok Yönetimi Sisteminin Kurulması
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '15000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  NULL,
  'Stok Yönetimi Sisteminin Kurulması',
  'Alibaba.com''da stok yönetimi, müşteri memnuniyetini ve satış oranını doğrudan etkiler. Bu görev, stok takip sisteminin kurulması, minimum stok seviyelerinin belirlenmesi ve düzenli güncelleme prosedürlerinin oluşturulmasını içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- ALT PROJE 6: REKLAM VE PAZARLAMA YÖNETİMİ
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'Reklam ve Pazarlama Yönetimi',
  'Alibaba.com''da reklam ve pazarlama, organik trafiğin yanında satış artışı sağlayan önemli bir araçtır. Bu aşama, P4P (Pay for Performance) reklamları, banner reklamları ve e-posta pazarlama kampanyalarının kurulması ve yönetilmesi süreçlerini içerir. Reklam kampanyaları, sürekli takip ve optimizasyon gerektirir.',
  'todo',
  6,
  0,
  NOW(),
  NOW()
);

-- Görev 6.1: Alibaba Reklam Hesabı Kurulumu
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '16000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000006',
  NULL,
  'Alibaba Reklam Hesabı Kurulumu',
  'Bu görev, Alibaba P4P (Pay for Performance) reklam hesabının açılması ve temel ayarların yapılması sürecidir. Reklam hesabı, satış artışı için kritik öneme sahiptir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 6.2: Anahtar Kelime Reklamları (Keyword Ads)
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '16000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000006',
  NULL,
  'Anahtar Kelime Reklamları (Keyword Ads)',
  'Alibaba.com''da anahtar kelime reklamları, ürünlerin arama sonuçlarında üst sıralarda görünmesini sağlar. Bu görev, hedef anahtar kelimelerin belirlenmesi, teklif fiyatlarının ayarlanması ve kampanyaların başlatılması süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 6.3: Ürün Vitrin Reklamları (Showcase Ads)
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '16000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000006',
  NULL,
  'Ürün Vitrin Reklamları (Showcase Ads)',
  'Showcase Ads, Alibaba.com''da ürünlerin öne çıkarılmasını sağlayan özel reklam türüdür. Bu görev, vitrine çıkacak ürünlerin seçilmesi ve kampanyaların oluşturulması süreçlerini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 6.4: Banner Reklamları (Display Ads)
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '16000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000006',
  NULL,
  'Banner Reklamları (Display Ads)',
  'Banner reklamları, Alibaba.com''da görsel olarak dikkat çeken ve trafik artışı sağlayan reklam türüdür. Bu görev, banner tasarımı ve kampanyaların oluşturulması süreçlerini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- Görev 6.5: E-posta Pazarlama (EDM)
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '16000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  NULL,
  'E-posta Pazarlama (EDM)',
  'E-posta pazarlama, mevcut ve potansiyel müşterilere ulaşmanın etkili bir yoludur. Bu görev, e-posta listesi oluşturma, şablon tasarımı ve kampanyaların başlatılması süreçlerini içerir.',
  'todo',
  'low',
  NULL,
  NULL,
  NULL,
  NULL,
  5,
  NOW(),
  NOW()
);

-- Görev 6.6: Performans Analizi ve Optimizasyon
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '16000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000006',
  NULL,
  'Performans Analizi ve Optimizasyon',
  'Reklam kampanyalarının performansı, sürekli takip ve optimizasyon gerektirir. Bu görev, CTR, dönüşüm oranı ve ROI analizlerini içerir. Düşük performanslı kampanyalar durdurulur, yüksek performanslı kampanyalara bütçe artırılır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  6,
  NOW(),
  NOW()
);

-- ALT PROJE 7: MÜŞTERİ İLİŞKİLERİ YÖNETİMİ
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'Müşteri İlişkileri Yönetimi',
  'Alibaba.com''da müşteri ilişkileri yönetimi, satış başarısının temelidir. Hızlı yanıt süreleri, profesyonel iletişim ve müşteri memnuniyeti, satış oranını artırır. Bu aşama, müşteri iletişim sisteminin kurulması, soru-cevap yönetimi ve sipariş takibi süreçlerini içerir.',
  'todo',
  7,
  0,
  NOW(),
  NOW()
);

-- Görev 7.1: Müşteri İletişim Sisteminin Kurulması
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '17000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000007',
  NULL,
  'Müşteri İletişim Sisteminin Kurulması',
  'Alibaba TradeManager, müşterilerle anlık iletişim kurmanın en önemli aracıdır. Bu görev, TradeManager kurulumu, otomatik yanıtlar ve hızlı yanıt şablonlarının hazırlanması süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 7.2: Müşteri Sorularının Yönetimi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '17000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000007',
  NULL,
  'Müşteri Sorularının Yönetimi',
  'Alibaba.com''da müşteri sorularına hızlı yanıt vermek, satış oranını artırır. Bu görev, gelen mesajların yönetilmesi ve profesyonel yanıtların hazırlanması süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 7.3: Teklif Hazırlama ve Gönderme
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '17000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000007',
  NULL,
  'Teklif Hazırlama ve Gönderme',
  'Profesyonel ve detaylı teklifler, satış oranını artırır. Bu görev, müşteri gereksinimlerinin analiz edilmesi, fiyat hesaplama ve teklif hazırlama süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 7.4: Numune Yönetimi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '17000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000007',
  NULL,
  'Numune Yönetimi',
  'Numune talepleri, potansiyel müşterilerin ürün kalitesini test etmek istediğini gösterir. Bu görev, numune taleplerinin değerlendirilmesi, hazırlama ve gönderim süreçlerini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- Görev 7.5: Sipariş Sonrası İletişim
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '17000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000007',
  NULL,
  'Sipariş Sonrası İletişim',
  'Sipariş sonrası iletişim, müşteri memnuniyetini artırır ve tekrar satış şansını yükseltir. Bu görev, üretim durumu güncellemeleri ve teslimat takibi süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  5,
  NOW(),
  NOW()
);

-- ALT PROJE 8: SİPARİŞ VE LOJİSTİK YÖNETİMİ
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'Sipariş ve Lojistik Yönetimi',
  'Alibaba.com''da sipariş yönetimi, müşteri memnuniyetini doğrudan etkiler. Bu aşama, sipariş alma, üretim süreci, kalite kontrol, paketleme ve sevkiyat süreçlerini içerir. Profesyonel sipariş yönetimi, müşteri güvenini artırır ve tekrar satış şansını yükseltir.',
  'todo',
  8,
  0,
  NOW(),
  NOW()
);

-- Görev 8.1: Sipariş Alma ve Onaylama
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '18000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000008',
  NULL,
  'Sipariş Alma ve Onaylama',
  'Bu görev, Alibaba.com''dan gelen siparişlerin incelenmesi, stok kontrolü ve onaylama süreçlerini içerir. Siparişler, hızlı ve doğru bir şekilde işlenmelidir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 8.2: Ödeme Takibi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '18000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000008',
  NULL,
  'Ödeme Takibi',
  'Ödeme takibi, sipariş sürecinin kritik bir parçasıdır. Bu görev, ödeme yönteminin belirlenmesi, ödeme alındığında onay ve üretim başlatma süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 8.3: Üretim Süreci Yönetimi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '18000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000008',
  NULL,
  'Üretim Süreci Yönetimi',
  'Bu görev, siparişin üretim sürecinin yönetilmesi ve müşteriye düzenli güncellemelerin gönderilmesi süreçlerini içerir. Üretim süreci, şeffaf ve takip edilebilir olmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 8.4: Kalite Kontrol
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '18000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000008',
  NULL,
  'Kalite Kontrol',
  'Kalite kontrol, müşteri memnuniyeti için kritik öneme sahiptir. Bu görev, nihai ürün kontrolü, kalite standartlarına uygunluk kontrolü ve müşteri onayı süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- Görev 8.5: Paketleme ve Etiketleme
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '18000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000008',
  NULL,
  'Paketleme ve Etiketleme',
  'Profesyonel paketleme, ürünlerin güvenli bir şekilde teslim edilmesini sağlar. Bu görev, paketleme malzemelerinin hazırlanması, etiketleme ve palet yükleme süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  5,
  NOW(),
  NOW()
);

-- Görev 8.6: Sevkiyat ve Lojistik
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '18000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000008',
  NULL,
  'Sevkiyat ve Lojistik',
  'Bu görev, kargo şirketinin seçilmesi, gümrük evraklarının hazırlanması ve sevkiyat sürecinin yönetilmesi süreçlerini içerir. Profesyonel lojistik yönetimi, müşteri memnuniyetini artırır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  6,
  NOW(),
  NOW()
);

-- Görev 8.7: Gümrük ve Teslimat Takibi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '18000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000008',
  NULL,
  'Gümrük ve Teslimat Takibi',
  'Bu görev, kargo durumunun takibi, gümrük işlemlerinin takibi ve teslimat sürecinin yönetilmesi süreçlerini içerir. Müşteriye düzenli güncellemeler gönderilmelidir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  7,
  NOW(),
  NOW()
);

-- ALT PROJE 9: PERFORMANS ANALİZİ VE İYİLEŞTİRME
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'Performans Analizi ve İyileştirme',
  'Alibaba.com''da sürekli performans analizi ve iyileştirme, uzun vadeli başarı için kritik öneme sahiptir. Bu aşama, satış performansı, mağaza trafiği, müşteri geri bildirimi ve rakip analizi süreçlerini içerir. Aylık raporlar hazırlanır ve iyileştirme planları oluşturulur.',
  'todo',
  9,
  0,
  NOW(),
  NOW()
);

-- Görev 9.1: Satış Performans Analizi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '19000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000009',
  NULL,
  'Satış Performans Analizi',
  'Bu görev, aylık satış raporlarının hazırlanması, ürün bazlı analiz ve müşteri segmentasyonu süreçlerini içerir. Analiz sonuçları, pazarlama stratejilerinin belirlenmesinde kullanılır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 9.2: Mağaza Performans Analizi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '19000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000009',
  NULL,
  'Mağaza Performans Analizi',
  'Bu görev, mağaza ziyaretçi sayısı, sayfa görüntüleme, bounce rate ve trafik kaynakları analizlerini içerir. Analiz sonuçları, SEO ve pazarlama stratejilerinin iyileştirilmesinde kullanılır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 9.3: Müşteri Geri Bildirimi Analizi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '19000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000009',
  NULL,
  'Müşteri Geri Bildirimi Analizi',
  'Müşteri geri bildirimi, hizmet kalitesinin artırılması için önemli bir kaynaktır. Bu görev, müşteri yorumlarının toplanması, analiz edilmesi ve iyileştirme alanlarının belirlenmesi süreçlerini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

-- Görev 9.4: Rakip Analizi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '19000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000009',
  NULL,
  'Rakip Analizi',
  'Rakip analizi, kendi pozisyonumuzu belirlemek ve pazarlama stratejilerini geliştirmek için önemlidir. Bu görev, ana rakiplerin belirlenmesi, fiyat analizi ve pazarlama stratejileri analizini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  4,
  NOW(),
  NOW()
);

-- Görev 9.5: İyileştirme Planı Oluşturma
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '19000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000009',
  NULL,
  'İyileştirme Planı Oluşturma',
  'Bu görev, performans analizi sonuçlarına dayanarak iyileştirme önerilerinin oluşturulması ve aksiyon planının hazırlanması süreçlerini içerir. İyileştirme planı, önceliklendirilmiş ve uygulanabilir olmalıdır.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  5,
  NOW(),
  NOW()
);

-- Görev 9.6: A/B Testleri ve Optimizasyon
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '19000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000009',
  NULL,
  'A/B Testleri ve Optimizasyon',
  'A/B testleri, pazarlama stratejilerinin etkinliğini ölçmek için kullanılır. Bu görev, test senaryolarının oluşturulması, testlerin yürütülmesi ve sonuçların analiz edilmesi süreçlerini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  6,
  NOW(),
  NOW()
);

-- ALT PROJE 10: EĞİTİM VE SÜREKLİ GELİŞİM
INSERT INTO sub_projects (
  id,
  project_id,
  name,
  description,
  status,
  order_index,
  progress,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Eğitim ve Sürekli Gelişim',
  'Alibaba.com platformu sürekli gelişmektedir ve yeni özellikler eklenmektedir. Bu aşama, ekip eğitimleri, platform güncellemeleri ve en iyi uygulamaların öğrenilmesi süreçlerini içerir. Sürekli eğitim, uzun vadeli başarı için kritik öneme sahiptir.',
  'todo',
  10,
  0,
  NOW(),
  NOW()
);

-- Görev 10.1: Alibaba Platform Eğitimleri
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '1a000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000010',
  NULL,
  'Alibaba Platform Eğitimleri',
  'Alibaba University, platform kullanımı için detaylı eğitimler sunar. Bu görev, temel ve ileri seviye kursların tamamlanması ve sertifika alınması süreçlerini içerir.',
  'todo',
  'high',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
);

-- Görev 10.2: Düzenli Webinar ve Etkinlik Katılımı
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '1a000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000010',
  NULL,
  'Düzenli Webinar ve Etkinlik Katılımı',
  'Alibaba, düzenli olarak webinarlar ve etkinlikler düzenler. Bu görev, bu etkinliklere katılım ve yeni özelliklerin öğrenilmesi süreçlerini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  NOW(),
  NOW()
);

-- Görev 10.3: Ekip Eğitimi
INSERT INTO tasks (
  id,
  sub_project_id,
  assigned_to,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  approved_at,
  approved_by,
  order_index,
  created_at,
  updated_at
) VALUES (
  '1a000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000010',
  NULL,
  'Ekip Eğitimi',
  'Firma ekibinin Alibaba.com platformunu etkin kullanabilmesi için düzenli eğitimler gereklidir. Bu görev, müşteri hizmetleri, pazarlama ve operasyon ekiplerine eğitim verilmesi süreçlerini içerir.',
  'todo',
  'medium',
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  NOW(),
  NOW()
);

















