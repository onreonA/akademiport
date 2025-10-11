# JWT Kimlik Doğrulama Sistemi Geçiş Rehberi

Bu rehber, API endpoint'lerini eski cookie/header tabanlı kimlik doğrulama sisteminden yeni JWT token tabanlı kimlik doğrulama sistemine geçirmek için adımları içerir.

## 1. Genel Bakış

Mevcut sistemde üç farklı kimlik doğrulama yöntemi kullanılmaktadır:

1. **Cookie tabanlı kimlik doğrulama** (`auth-user-email`, `auth-user-role`, `auth-user-company-id`)
2. **Header tabanlı kimlik doğrulama** (`X-User-Email`)
3. **JWT token tabanlı kimlik doğrulama** (`auth-token` cookie)

Hedef, tüm API endpoint'lerini JWT token tabanlı kimlik doğrulamaya geçirmektir.

## 2. Mevcut Durum

- 188 API endpoint dosyası
- 103 endpoint cookie tabanlı kimlik doğrulama kullanıyor
- 116 endpoint header tabanlı kimlik doğrulama kullanıyor
- Bazı endpoint'ler her iki yöntemi de destekliyor

## 3. Geçiş Adımları

Her API endpoint için aşağıdaki değişiklikleri yapmanız gerekiyor:

### 3.1. Import Ekle

```typescript
import {
  requireAuth,
  requireAdmin,
  requireCompany,
  createAuthErrorResponse,
} from '@/lib/jwt-utils';
```

### 3.2. Kimlik Doğrulama Kodunu Değiştir

**Eski Kod (Cookie tabanlı):**

```typescript
const userEmail = request.cookies.get('auth-user-email')?.value;
const userRole = request.cookies.get('auth-user-role')?.value;
const userCompanyId = request.cookies.get('auth-user-company-id')?.value;

if (!userEmail || !userRole) {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  );
}
```

**Yeni Kod (JWT tabanlı):**

```typescript
// Genel kimlik doğrulama için:
const user = await requireAuth(request);

// Sadece admin erişimi için:
const user = await requireAdmin(request);

// Sadece firma kullanıcıları için:
const user = await requireCompany(request);
```

### 3.3. Kullanıcı Bilgilerini Güncelle

**Eski Kod:**

```typescript
.eq('email', userEmail)
```

**Yeni Kod:**

```typescript
.eq('email', user.email)
```

### 3.4. Rol Kontrolünü Güncelle

**Eski Kod:**

```typescript
if (!['admin', 'consultant'].includes(userRole)) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

**Yeni Kod:**

```typescript
if (!['admin', 'consultant'].includes(user.role)) {
  return createAuthErrorResponse('Access denied', 403);
}
```

### 3.5. Hata Yakalama Bloğunu Güncelle

**Eski Kod:**

```typescript
catch (error) {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Yeni Kod:**

```typescript
catch (error: any) {
  // Handle authentication errors specifically
  if (error.message === 'Authentication required' ||
      error.message === 'Admin access required' ||
      error.message === 'Company access required') {
    return createAuthErrorResponse(error.message, 401);
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## 4. Önemli Notlar

1. **Rol İsimleri:** Türkçe karakterler içeren rol isimleri (`firma_kullanıcı`) yerine İngilizce karakter içeren rol isimlerini (`firma_kullanici`) kullanın.

2. **Company ID:** JWT token'dan `user.company_id` kullanın, Supabase sorgusu ile tekrar almaya gerek yok.

3. **Erişim Kontrolü:** Firma kullanıcıları sadece kendi firmalarına ait verilere erişebilmeli.

4. **Test:** Her değişiklikten sonra ilgili endpoint'i test edin.

## 5. Örnek Şablon

`migration-templates/jwt-auth-migration-template.ts` dosyasını referans olarak kullanabilirsiniz.
