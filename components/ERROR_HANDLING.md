# 🛡️ Error Handling Guide

Bu dokümantasyon projede hata yönetimi için kullanılan component'leri açıklar.

## 📦 **Kullanılabilir Component'ler**

### 1️⃣ **ErrorBoundary** (Global Error Handler)

React component tree'sinde oluşan JavaScript hatalarını yakalar ve kullanıcıya user-friendly bir mesaj gösterir.

**Import:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';
```

**Kullanım:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children`: Korunacak component'ler (required)
- `fallback`: Custom hata UI (optional)
- `onError`: Hata yakalandığında çağrılacak callback (optional)

**Örnekler:**

```tsx
// Basit kullanım
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>

// Custom fallback UI ile
<ErrorBoundary fallback={<div>Özel hata mesajı</div>}>
  <ComplexComponent />
</ErrorBoundary>

// Error logging ile
<ErrorBoundary onError={(error, errorInfo) => {
  logToService(error, errorInfo);
}}>
  <ComplexComponent />
</ErrorBoundary>
```

---

### 2️⃣ **InlineErrorBoundary** (Component-level Handler)

Küçük component'ler için inline hata göstergesi.

**Import:**
```tsx
import { InlineErrorBoundary } from '@/components/ErrorBoundary';
```

**Kullanım:**
```tsx
<InlineErrorBoundary>
  <SmallComponent />
</InlineErrorBoundary>
```

**Ne Zaman Kullanılır?**
- Card içindeki küçük component'ler
- Liste item'ları
- Widget'lar
- Dashboard kartları

**Örnek:**
```tsx
<div className="grid grid-cols-3 gap-4">
  <InlineErrorBoundary>
    <StatsCard title="Toplam" value={stats.total} />
  </InlineErrorBoundary>
  
  <InlineErrorBoundary>
    <StatsCard title="Aktif" value={stats.active} />
  </InlineErrorBoundary>
  
  <InlineErrorBoundary>
    <StatsCard title="Tamamlanan" value={stats.completed} />
  </InlineErrorBoundary>
</div>
```

---

### 3️⃣ **ApiErrorHandler** (API Error Display)

API call'larından dönen hataları user-friendly şekilde gösterir.

**Import:**
```tsx
import ApiErrorHandler from '@/components/ApiErrorHandler';
```

**Kullanım:**
```tsx
{error && <ApiErrorHandler error={error} onRetry={fetchData} />}
```

**Props:**
- `error`: Error object veya string (required)
- `onRetry`: Tekrar deneme callback (optional)
- `className`: Ek CSS class'ları (optional)
- `compact`: Kompakt görünüm (optional)

**Özellikler:**
- ✅ Otomatik error message parsing
- ✅ User-friendly mesajlar (401, 403, 404, 500, network errors)
- ✅ Tekrar deneme butonu
- ✅ Development'ta detaylı error gösterimi
- ✅ Compact ve full mode

**Örnekler:**

```tsx
// Basit kullanım
const [error, setError] = useState(null);
const [data, setData] = useState(null);

const fetchData = async () => {
  try {
    setError(null);
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('API error');
    const result = await response.json();
    setData(result);
  } catch (err) {
    setError(err);
  }
};

return (
  <>
    {error && <ApiErrorHandler error={error} onRetry={fetchData} />}
    {data && <DataDisplay data={data} />}
  </>
);

// Compact mode (inline error)
{error && <ApiErrorHandler error={error} onRetry={fetchData} compact />}

// Custom className
{error && (
  <ApiErrorHandler 
    error={error} 
    onRetry={fetchData} 
    className="mb-4"
  />
)}
```

---

### 4️⃣ **NetworkError** (Network-Specific Handler)

Özellikle network/bağlantı hataları için.

**Import:**
```tsx
import { NetworkError } from '@/components/ApiErrorHandler';
```

**Kullanım:**
```tsx
{isNetworkError && <NetworkError onRetry={fetchData} />}
```

**Ne Zaman Kullanılır?**
- Internet connection kaybı
- Timeout errors
- DNS resolution failures

**Örnek:**
```tsx
const [isNetworkError, setIsNetworkError] = useState(false);

const fetchData = async () => {
  try {
    setIsNetworkError(false);
    const response = await fetch('/api/data');
    setData(await response.json());
  } catch (err) {
    if (err.message.includes('fetch failed') || err.message.includes('Network')) {
      setIsNetworkError(true);
    }
  }
};

return (
  <>
    {isNetworkError && <NetworkError onRetry={fetchData} />}
    {data && <DataDisplay data={data} />}
  </>
);
```

---

### 5️⃣ **NotFoundError** (404 Handler)

404 hataları için özel component.

**Import:**
```tsx
import { NotFoundError } from '@/components/ApiErrorHandler';
```

**Kullanım:**
```tsx
{!data && !loading && <NotFoundError message="Proje bulunamadı" onBack={goBack} />}
```

**Props:**
- `message`: Custom mesaj (optional)
- `onBack`: Geri dönme callback (optional)

**Örnek:**
```tsx
const [project, setProject] = useState(null);
const [loading, setLoading] = useState(true);
const router = useRouter();

useEffect(() => {
  fetchProject().then(setProject).finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;

if (!project) {
  return (
    <NotFoundError 
      message="İstediğiniz proje bulunamadı." 
      onBack={() => router.push('/projects')}
    />
  );
}

return <ProjectDetails project={project} />;
```

---

## 🎯 **Best Practices**

### ✅ **DO (Yapılması Gerekenler)**

```tsx
// ✅ ErrorBoundary ile sayfa koruma
<ErrorBoundary>
  <PageContent />
</ErrorBoundary>

// ✅ API error handling
const [error, setError] = useState(null);
{error && <ApiErrorHandler error={error} onRetry={fetchData} />}

// ✅ Inline error boundaries for widgets
<InlineErrorBoundary>
  <DashboardWidget />
</InlineErrorBoundary>

// ✅ Specific error types
{isNetworkError && <NetworkError onRetry={retry} />}
{is404 && <NotFoundError onBack={goBack} />}

// ✅ Error logging (production)
<ErrorBoundary onError={(error, info) => {
  logToSentry(error, info);
}}>
```

### ❌ **DON'T (Yapılmaması Gerekenler)**

```tsx
// ❌ ErrorBoundary olmadan kritik component
<ComplexComponent />  // Hata olursa tüm sayfa çöker

// ❌ Try-catch olmadan API call
const data = await fetch('/api/data');  // Hata handling yok

// ❌ Generic error message
{error && <div>Error occurred</div>}  // User-friendly değil

// ❌ Error state'i temizlememek
{error && <ApiErrorHandler error={error} />}  // onRetry yok

// ❌ Console.error yerine alert
catch (error) {
  alert(error.message);  // Kötü UX
}
```

---

## 📋 **Implementation Checklist**

### **Sayfa Seviyesi (Page Level)**

- [ ] Root layout'da `ErrorBoundary` var mı?
- [ ] Her sayfa için error state tanımlı mı?
- [ ] API call'larında try-catch var mı?
- [ ] `ApiErrorHandler` kullanılıyor mu?
- [ ] Retry mekanizması çalışıyor mu?

### **Component Seviyesi**

- [ ] Kritik component'ler `ErrorBoundary` ile sarılmış mı?
- [ ] Widget'lar `InlineErrorBoundary` kullanıyor mu?
- [ ] Loading ve error state'leri ayrı mı?
- [ ] Kullanıcıya bilgi veriliyor mu?

### **API Seviyesi**

- [ ] Tüm fetch call'larında error handling var mı?
- [ ] HTTP status code'ları kontrol ediliyor mu?
- [ ] Network error'ları yakalanıyor mu?
- [ ] Timeout handling var mı?

---

## 🔄 **Migration Guide**

### **Eski Kod (Önce):**

```tsx
// Eski hata yönetimi
function MyPage() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);  // ❌ Kötü UX
  }, []);
  
  return <div>{data ? <Content data={data} /> : 'Loading...'}</div>;
}
```

### **Yeni Kod (Sonra):**

```tsx
// Modern hata yönetimi
import ErrorBoundary from '@/components/ErrorBoundary';
import ApiErrorHandler from '@/components/ApiErrorHandler';

function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('API failed');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <ErrorBoundary>
      {loading && <LoadingSpinner />}
      {error && <ApiErrorHandler error={error} onRetry={fetchData} />}
      {data && <Content data={data} />}
    </ErrorBoundary>
  );
}
```

**Kazanç:**
- ✅ User-friendly error messages
- ✅ Retry mechanism
- ✅ Component crash protection
- ✅ Better UX

---

## 🚀 **Advanced Usage**

### **Custom Error Tracking**

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

// Error tracking service (örn: Sentry)
function logErrorToService(error, errorInfo) {
  // Sentry.captureException(error, {
  //   extra: errorInfo,
  // });
}

<ErrorBoundary onError={logErrorToService}>
  <App />
</ErrorBoundary>
```

### **Route-Specific Error Handling**

```tsx
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8">
          <h1>Admin Paneli Hatası</h1>
          <p>Lütfen sistem yöneticisine bildirin.</p>
          <Button onClick={() => window.location.href = '/'}>
            Ana Sayfaya Dön
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

### **Multiple Error Boundaries**

```tsx
<ErrorBoundary>  {/* Page level */}
  <Header />
  
  <main>
    <ErrorBoundary>  {/* Section level */}
      <Sidebar />
    </ErrorBoundary>
    
    <ErrorBoundary>  {/* Section level */}
      <Content>
        <InlineErrorBoundary>  {/* Widget level */}
          <StatsWidget />
        </InlineErrorBoundary>
      </Content>
    </ErrorBoundary>
  </main>
  
  <Footer />
</ErrorBoundary>
```

---

## 📊 **Error Monitoring (Future)**

### **TODO: Production Error Tracking**

```tsx
// lib/error-tracking.ts
export function initErrorTracking() {
  if (process.env.NODE_ENV === 'production') {
    // Initialize Sentry, LogRocket, etc.
  }
}

export function logError(error, context) {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
  } else {
    console.error(error, context);
  }
}
```

---

## 📝 **Changelog**

### **v1.0.0 (2025-01-11)**
- ✅ ErrorBoundary component eklendi
- ✅ InlineErrorBoundary eklendi
- ✅ ApiErrorHandler eklendi
- ✅ NetworkError component eklendi
- ✅ NotFoundError component eklendi
- ✅ Root layout'a entegrasyon

---

**Happy Error Handling! 🛡️**

