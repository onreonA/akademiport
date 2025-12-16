/**
 * Browser Console Script: Toplu Firma Ekleme
 *
 * Kullanım:
 * 1. Browser console'u açın (F12)
 * 2. Bu scripti yapıştırın ve çalıştırın
 * 3. Firmalar otomatik olarak eklenir
 */

// Program ID (Kayseri E-İhracat Programı)
const PROGRAM_ID = '10000000-0000-0000-0000-000000000001';

// Telefon numarası normalize fonksiyonu
function normalizePhone(phoneStr) {
  if (!phoneStr || phoneStr.trim() === '') return null;

  // "11111111 530 282 84 48" formatından sadece gerçek numarayı al
  const parts = phoneStr.trim().split(/\s+/);

  // İlk kısım "11111111" gibi placeholder ise atla
  let phoneNumber = '';
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] && !parts[i].startsWith('11111111')) {
      phoneNumber += parts[i].replace(/\s+/g, '');
    }
  }

  // Eğer numara bulunamadıysa null döndür
  if (!phoneNumber || phoneNumber.length < 10) return null;

  // Türkiye için "+90" veya "0" ile başlamalı
  // Eğer 10 haneli ise (5302828448) → "+9053028284848" veya "053028284848"
  if (phoneNumber.length === 10) {
    // "+90" formatına çevir
    return `+90${phoneNumber}`;
  } else if (phoneNumber.length === 11 && phoneNumber.startsWith('0')) {
    // Zaten "0" ile başlıyorsa "+90" ile değiştir
    return `+90${phoneNumber.substring(1)}`;
  } else if (phoneNumber.length === 13 && phoneNumber.startsWith('+90')) {
    // Zaten "+90" formatında
    return phoneNumber;
  }

  // Diğer durumlar için "+90" ekle
  return `+90${phoneNumber}`;
}

// Slug oluşturma fonksiyonu
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Resimdeki firmalar (resimden alınan veriler)
const companies = [
  {
    name: 'Kamer Mobilya',
    legalName:
      'KAMER MOBILYA MEFRUSAT CELIK ESYA DAYANIKLI TUKETIM MALLARI EV GERECLERI AHSAP METAL ISLERI TASIMACILIK TEKSTIL YAYLI YATAKLAR SANAYI VE TICARET LIMITED SIRKETI',
    email: 'hilalkavafoglu@gmail.com',
    phone: '11111111 530 282 84 48',
    foundationYear: 1900, // placeholder
    postalCode: '38000', // placeholder
  },
  {
    name: '@home Mobilya',
    legalName: 'athome mobilya tekstil inşaat gıda ve ihtiyaç maddeleri san. ve tic. a.ş.',
    email: 'bilal@athomefurniture.com.tr',
    phone: '11111111 533 565 42 90',
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Lora Mobilya (Mimsan)',
    legalName: 'MİMSAN EV GEREÇLERİ SAN VE TİC.LTD.ŞTİ,',
    email: 'B.cinar@lora.com.tr',
    phone: '11111111 530 282 84 48', // Örnek, gerçek numara yok
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'ABS Door',
    legalName: 'ABS Door', // Tam ünvan resimde görünmüyor
    email: 'onurozcan@absdoor.com',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Ermetsan Door',
    legalName: 'Ermetsan Door', // Tam ünvan resimde görünmüyor
    email: 'isletme@ermetsan.com.tr',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Rosehan Tekstil',
    legalName: 'Rosehan Tekstil', // Tam ünvan resimde görünmüyor
    email: 'globalrosehan@gmail.com',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Rosse metal Ahşap',
    legalName: 'Rosse metal Ahşap', // Tam ünvan resimde görünmüyor
    email: 'Info@rossemobilya.com.tr',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Lale Orman AS',
    legalName: 'Lale Orman AS', // Tam ünvan resimde görünmüyor
    email: 'hasan.kilic@laleorman.com',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Oylum Sınai Yatırımlar',
    legalName: 'Oylum Sınai Yatırımlar', // Tam ünvan resimde görünmüyor
    email: 'y.eminel@oylum.com',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Femaş',
    legalName: 'Femaş', // Tam ünvan resimde görünmüyor
    email: 'deniz.cakmakoglu@ferre.com.tr',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Atlas Sayaç',
    legalName: 'Atlas Sayaç', // Tam ünvan resimde görünmüyor
    email: 'sales3@atlassayac.com',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Ödül Madeni Eşya',
    legalName: 'Ödül Madeni Eşya', // Tam ünvan resimde görünmüyor
    email: 'ibrahimc@odul.com.tr',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Mundo Yatak',
    legalName: 'Mundo Yatak', // Tam ünvan resimde görünmüyor
    email: 'fatih.atalay@mundoyatak.com',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Kayzer',
    legalName: 'Kayzer', // Tam ünvan resimde görünmüyor
    email: 'info@noticebedding.com',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Şahbaz Makine',
    legalName: 'Şahbaz Makine', // Tam ünvan resimde görünmüyor
    email: 'omer@brunetta.com.tr',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Anatolia',
    legalName: 'Anatolia', // Tam ünvan resimde görünmüyor
    email: 'Halit.bektas@polizone.com.tr',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Bese',
    legalName: 'Bese', // Tam ünvan resimde görünmüyor
    email: 'samibekli@mywin.com.tr',
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Kayra',
    legalName: 'Kayra', // Tam ünvan resimde görünmüyor
    email: '', // Resimde görünmüyor
    phone: '11111111 530 282 84 48', // Örnek
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Milenyum Metal',
    legalName: 'MİLENYUM METAL DIŞ TİC VE SAN AŞ',
    email: 'mbasti@palm.com.tr',
    phone: '11111111 554 935 82 78',
    foundationYear: 1900,
    postalCode: '38000',
  },
  {
    name: 'Tepe Plastik',
    legalName: 'Tepe Plastik ve Enjeksiyon San. Tic. Ltd. Şti.',
    email: 'serdartepeplastik@gmail.com',
    phone: '11111111 554 882 60 66',
    foundationYear: 1900,
    postalCode: '38000',
  },
];

// CreateCompanyDto formatına çevir
function prepareCompanyData(company) {
  const normalizedPhone = normalizePhone(company.phone);

  return {
    programId: PROGRAM_ID,
    name: company.name.substring(0, 100), // Max 100 karakter
    legalName: company.legalName ? company.legalName.substring(0, 200) : null, // Max 200 karakter
    email: company.email && company.email.trim() !== '' ? company.email.trim() : null,
    phone: normalizedPhone,
    city: 'Kayseri',
    country: 'Türkiye',
    foundationYear: company.foundationYear === 1900 ? null : company.foundationYear, // Placeholder değerleri null yap
    postalCode: company.postalCode === '38000' ? null : company.postalCode, // Placeholder değerleri null yap
    maxUsers: 2,
  };
}

// Firma ekleme fonksiyonu
async function createCompany(companyData) {
  try {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log(`✅ ${companyData.name} başarıyla eklendi`);
      return { success: true, data: result.data };
    } else {
      console.error(`❌ ${companyData.name} eklenemedi:`, result.error || result.details);
      return { success: false, error: result.error || result.details };
    }
  } catch (error) {
    console.error(`❌ ${companyData.name} eklenirken hata:`, error);
    return { success: false, error: error.message };
  }
}

// Tüm firmaları ekle
async function bulkAddCompanies() {
  console.log(`🚀 ${companies.length} firma ekleniyor...`);
  console.log('Program ID:', PROGRAM_ID);
  console.log('---');

  const results = [];

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const companyData = prepareCompanyData(company);

    console.log(`\n[${i + 1}/${companies.length}] ${company.name} ekleniyor...`);
    console.log('Veri:', companyData);

    const result = await createCompany(companyData);
    results.push({ company: company.name, ...result });

    // Her istek arasında kısa bir bekleme (rate limiting için)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Özet
  console.log('\n=== ÖZET ===');
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Başarısız: ${failCount}`);

  if (failCount > 0) {
    console.log('\nBaşarısız firmalar:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`- ${r.company}: ${JSON.stringify(r.error)}`);
      });
  }

  return results;
}

// Scripti çalıştır
bulkAddCompanies()
  .then((results) => {
    console.log('\n✅ İşlem tamamlandı!');
    console.log('Sonuçlar:', results);
  })
  .catch((error) => {
    console.error('❌ Hata:', error);
  });
