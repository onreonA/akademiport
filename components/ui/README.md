# 🎨 Reusable UI Components

Bu klasörde projenin tamamında kullanılabilecek reusable (tekrar kullanılabilir) UI component'leri bulunur.

## 📦 **Mevcut Component'ler**

### 1️⃣ **Card Component**

Tutarlı card tasarımı için kullanılır.

**Import:**

```tsx
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
```

**Kullanım:**

```tsx
<Card shadow='md' hover padding='lg'>
  <CardTitle>Card Başlığı</CardTitle>
  <CardContent>
    <p>Card içeriği burada...</p>
  </CardContent>
  <CardFooter>
    <Button variant='primary'>Aksiyon</Button>
  </CardFooter>
</Card>
```

**Props:**

- `shadow`: `'sm' | 'md' | 'lg' | 'xl'` - Card gölgesi (default: `'sm'`)
- `hover`: `boolean` - Hover efekti (default: `false`)
- `padding`: `'sm' | 'md' | 'lg'` - İç boşluk (default: `'md'`)
- `className`: `string` - Ek CSS class'ları
- `onClick`: `() => void` - Click handler (optional)

**Örnekler:**

```tsx
// Basit Card
<Card>
  <p>Basit içerik</p>
</Card>

// Hover efektli Card
<Card hover shadow="lg" onClick={handleClick}>
  <CardTitle>Tıklanabilir Card</CardTitle>
  <CardContent>Üzerine gelince büyür</CardContent>
</Card>

// Tam özellikli Card
<Card shadow="xl" padding="lg">
  <CardHeader>
    <CardTitle>Başlık</CardTitle>
    <p className="text-sm text-gray-500">Alt başlık</p>
  </CardHeader>
  <CardContent>
    <p>İçerik burada...</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary">İptal</Button>
    <Button variant="primary">Kaydet</Button>
  </CardFooter>
</Card>
```

---

### 2️⃣ **Modal Component**

Overlay ile modal dialog için kullanılır.

**Import:**

```tsx
import Modal, { ModalFooter } from '@/components/ui/Modal';
```

**Kullanım:**

```tsx
<Modal isOpen={isOpen} onClose={handleClose} title='Modal Başlığı' size='lg'>
  <p>Modal içeriği...</p>
  <ModalFooter>
    <Button variant='secondary' onClick={handleClose}>
      İptal
    </Button>
    <Button variant='primary' onClick={handleSave}>
      Kaydet
    </Button>
  </ModalFooter>
</Modal>
```

**Props:**

- `isOpen`: `boolean` - Modal açık mı? (required)
- `onClose`: `() => void` - Kapanma handler (required)
- `title`: `string` - Modal başlığı (optional)
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal boyutu (default: `'md'`)
- `closeOnOverlayClick`: `boolean` - Overlay'e tıklayınca kapansın mı? (default: `true`)

**Özellikler:**

- ✅ ESC tuşu ile kapanma
- ✅ Body scroll engelleme
- ✅ Overlay ile backdrop
- ✅ Sticky header & footer
- ✅ Responsive tasarım
- ✅ Max-height ile scroll

**Örnekler:**

```tsx
// Küçük onay modal'ı
<Modal isOpen={showConfirm} onClose={handleCancel} title="Emin misiniz?" size="sm">
  <p>Bu işlem geri alınamaz!</p>
  <ModalFooter>
    <Button variant="secondary" onClick={handleCancel}>Hayır</Button>
    <Button variant="danger" onClick={handleConfirm}>Evet, Sil</Button>
  </ModalFooter>
</Modal>

// Büyük form modal'ı
<Modal isOpen={showForm} onClose={handleClose} title="Yeni Kayıt" size="xl">
  <form onSubmit={handleSubmit}>
    <div className="grid grid-cols-2 gap-4">
      <input type="text" placeholder="Ad" />
      <input type="text" placeholder="Soyad" />
    </div>
    <ModalFooter>
      <Button variant="secondary" onClick={handleClose}>İptal</Button>
      <Button variant="primary" type="submit">Kaydet</Button>
    </ModalFooter>
  </form>
</Modal>

// Overlay'e tıklamayı devre dışı bırak
<Modal
  isOpen={showCritical}
  onClose={handleClose}
  title="Kritik İşlem"
  closeOnOverlayClick={false}
>
  <p>Bu modal sadece butonlarla kapatılabilir.</p>
  <ModalFooter>
    <Button variant="primary" onClick={handleClose}>Tamam</Button>
  </ModalFooter>
</Modal>
```

---

### 3️⃣ **Button Component**

Tutarlı button tasarımı ve loading state ile.

**Import:**

```tsx
import Button from '@/components/ui/Button';
```

**Kullanım:**

```tsx
<Button variant='primary' size='md' onClick={handleClick}>
  Tıkla
</Button>
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'success' | 'danger' | 'ghost'` - Button tipi (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` - Button boyutu (default: `'md'`)
- `loading`: `boolean` - Yükleniyor durumu (default: `false`)
- `fullWidth`: `boolean` - Tam genişlik (default: `false`)
- `icon`: `React.ReactNode` - İkon (optional)
- `disabled`: `boolean` - Devre dışı (optional)
- `className`: `string` - Ek CSS class'ları
- ...diğer HTML button props

**Örnekler:**

```tsx
// Primary button
<Button variant="primary" onClick={handleSave}>
  Kaydet
</Button>

// Loading state
<Button variant="primary" loading={isSaving} onClick={handleSave}>
  Kaydet
</Button>

// İkonlu button
<Button variant="success" icon={<i className="ri-check-line" />}>
  Onayla
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Sil
</Button>

// Ghost button (transparent)
<Button variant="ghost" onClick={handleCancel}>
  İptal
</Button>

// Tam genişlik button
<Button variant="primary" fullWidth>
  Gönder
</Button>

// Küçük button
<Button variant="secondary" size="sm">
  Küçük
</Button>

// Büyük button
<Button variant="primary" size="lg">
  Büyük
</Button>
```

---

## 🎯 **Kullanım Örnekleri: Gerçek Senaryolar**

### **Senaryo 1: Liste Sayfası**

```tsx
import Card, { CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function ProjectList() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {projects.map(project => (
        <Card key={project.id} hover onClick={() => handleView(project.id)}>
          <CardTitle>{project.name}</CardTitle>
          <CardContent>
            <p className='text-sm text-gray-600'>{project.description}</p>
            <div className='mt-4'>
              <Button variant='primary' size='sm' fullWidth>
                Detayları Gör
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### **Senaryo 2: CRUD İşlemleri**

```tsx
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveUser();
    setSaving(false);
    setShowModal(false);
  };

  return (
    <>
      <Button variant='primary' onClick={() => setShowModal(true)}>
        Yeni Kullanıcı
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title='Yeni Kullanıcı Ekle'
        size='lg'
      >
        <form>
          <input type='text' placeholder='Ad' className='w-full mb-4' />
          <input type='email' placeholder='Email' className='w-full mb-4' />
        </form>

        <ModalFooter>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            İptal
          </Button>
          <Button variant='primary' loading={saving} onClick={handleSave}>
            Kaydet
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

### **Senaryo 3: Onay Dialogu**

```tsx
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

function DeleteConfirmation({ item, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteItem(item.id);
    setDeleting(false);
    onConfirm();
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title='Silme Onayı' size='sm'>
      <p className='text-gray-700'>
        <strong>{item.name}</strong> silinecek. Bu işlem geri alınamaz!
      </p>

      <ModalFooter>
        <Button variant='secondary' onClick={onCancel}>
          İptal
        </Button>
        <Button variant='danger' loading={deleting} onClick={handleDelete}>
          Sil
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

---

## 📐 **Best Practices**

### ✅ **DO (Yapılması Gerekenler)**

```tsx
// ✅ Component'leri tutarlı kullan
<Card shadow="md" hover>
  <CardTitle>Başlık</CardTitle>
  <CardContent>İçerik</CardContent>
</Card>

// ✅ Loading state'leri göster
<Button variant="primary" loading={isSaving}>
  Kaydet
</Button>

// ✅ Variant'ları doğru kullan
<Button variant="danger" onClick={handleDelete}>Sil</Button>
<Button variant="success" onClick={handleApprove}>Onayla</Button>

// ✅ Modal'ları kontrollü kapat
<Modal isOpen={isOpen} onClose={() => {
  // Cleanup
  resetForm();
  setIsOpen(false);
}}>
```

### ❌ **DON'T (Yapılmaması Gerekenler)**

```tsx
// ❌ Inline style kullanma
<Card style={{ backgroundColor: 'white' }}>  // Yanlış
<Card className="bg-white">  // Doğru

// ❌ className override etme (gereksiz)
<Button className="bg-red-500">  // Yanlış
<Button variant="danger">  // Doğru

// ❌ Modal içinde başka modal açma
<Modal>
  <Modal>  // Yanlış - UX sorunu
  </Modal>
</Modal>

// ❌ Button içinde button
<Button>
  <button>İç button</button>  // Yanlış
</Button>
```

---

## 🔧 **Özelleştirme**

Component'leri özelleştirmek için `className` prop'unu kullanın:

```tsx
// Ek stil ekle
<Card className="border-2 border-blue-500">
  <CardTitle className="text-blue-600">Özel Renk</CardTitle>
</Card>

// Ek margin/padding ekle
<Button className="mt-4" variant="primary">
  Yukarı Margin
</Button>

// Grid layout
<div className="grid grid-cols-3 gap-4">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</div>
```

---

## 📊 **Performans İpuçları**

1. **Lazy Loading:** Büyük modal'ları lazy load edin:

```tsx
const LazyModal = dynamic(() => import('@/components/ui/Modal'));
```

2. **Memoization:** Liste render'larında React.memo kullanın:

```tsx
const MemoizedCard = React.memo(({ data }) => (
  <Card>
    <CardTitle>{data.title}</CardTitle>
  </Card>
));
```

3. **Callback Optimization:** useCallback ile optimize edin:

```tsx
const handleClick = useCallback(() => {
  // Handler logic
}, [deps]);

<Button onClick={handleClick}>Click</Button>;
```

---

## 🚀 **Migration Guide**

Eski koddan yeni component'lere geçiş:

### **Eski Card:**

```tsx
<div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
  <h3 className='text-lg font-semibold'>Başlık</h3>
  <p>İçerik</p>
</div>
```

### **Yeni Card:**

```tsx
<Card>
  <CardTitle>Başlık</CardTitle>
  <CardContent>İçerik</CardContent>
</Card>
```

**Kazanç:** ~40% daha az kod, daha okunabilir.

---

## 📝 **Changelog**

### **v1.0.0 (2025-01-11)**

- ✅ Card component eklendi
- ✅ Modal component eklendi
- ✅ Button component eklendi
- ✅ TypeScript support
- ✅ Accessibility (a11y) desteği

---

## 🤝 **Katkıda Bulunma**

Yeni component eklemek veya mevcut component'leri geliştirmek için:

1. Component'i oluştur: `components/ui/YourComponent.tsx`
2. TypeScript interface'lerini tanımla
3. Dokümantasyonu ekle (bu dosyaya)
4. Örnek kullanımlar yaz
5. Test et ve commit et

---

## 📧 **Destek**

Sorularınız için proje ekibiyle iletişime geçin.

**Happy Coding! 🚀**
