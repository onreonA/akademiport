# API Documentation

Akademi Port REST API dokümantasyonu.

## 🔐 Authentication

Tüm API endpoint'leri (public olanlar hariç) authentication gerektirir.

### Headers

```http
Content-Type: application/json
Cookie: sb-access-token=...
```

---

## 📝 Authentication Endpoints

### Sign Up

Yeni kullanıcı kaydı.

```http
POST /api/auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+90 555 123 4567",
  "role": "company_user",
  "companyId": "uuid"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "company_user",
    "companyId": "uuid"
  },
  "message": "Kayıt başarılı! Email adresinizi doğrulayın."
}
```

---

### Sign In

Kullanıcı girişi.

```http
POST /api/auth/signin
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "company_user",
    "avatarUrl": "https://...",
    "companyId": "uuid"
  },
  "message": "Giriş başarılı"
}
```

---

### Sign Out

Kullanıcı çıkışı.

```http
POST /api/auth/signout
```

**Response (200):**

```json
{
  "success": true,
  "message": "Çıkış başarılı"
}
```

---

### Get Current User

Mevcut kullanıcı bilgilerini al.

```http
GET /api/auth/me
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "company_user",
    "avatarUrl": "https://...",
    "companyId": "uuid"
  }
}
```

---

## 🎯 Programs Endpoints

### List Programs

Tüm programları listele.

```http
GET /api/programs
GET /api/programs?status=active
GET /api/programs?city=Kayseri
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Kayseri E-İhracat 2025",
      "description": "...",
      "slug": "kayseri-e-ihracat-2025",
      "city": "Kayseri",
      "region": "İç Anadolu",
      "programType": "E-İhracat",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "durationMonths": 12,
      "maxCompanies": 20,
      "currentCompanies": 5,
      "status": "active",
      "sponsor": "Ticaret Bakanlığı",
      "budget": 500000,
      "programManagerId": "uuid",
      "settings": {},
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Get Program by ID

Belirli bir programı getir.

```http
GET /api/programs/:id
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kayseri E-İhracat 2025",
    ...
  }
}
```

---

### Create Program

Yeni program oluştur.

```http
POST /api/programs
```

**Request Body:**

```json
{
  "name": "Bursa E-İhracat 2025",
  "description": "Bursa için e-ihracat programı",
  "slug": "bursa-e-ihracat-2025",
  "city": "Bursa",
  "region": "Marmara",
  "programType": "E-İhracat",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "durationMonths": 12,
  "maxCompanies": 15,
  "sponsor": "KOSGEB",
  "budget": 300000
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Program başarıyla oluşturuldu"
}
```

---

### Update Program

Programı güncelle.

```http
PATCH /api/programs/:id
```

**Request Body:**

```json
{
  "status": "completed",
  "maxCompanies": 25
}
```

**Response (200):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Program başarıyla güncellendi"
}
```

---

### Delete Program

Programı sil.

```http
DELETE /api/programs/:id
```

**Response (200):**

```json
{
  "success": true,
  "message": "Program başarıyla silindi"
}
```

---

## 🏢 Companies Endpoints

### List Companies

Tüm firmaları listele.

```http
GET /api/companies
GET /api/companies?programId=uuid
GET /api/companies?city=Kayseri
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "programId": "uuid",
      "name": "Örnek Tekstil A.Ş.",
      "legalName": "Örnek Tekstil Anonim Şirketi",
      "taxNumber": "1234567890",
      "slug": "ornek-tekstil",
      "email": "info@ornektekstil.com",
      "phone": "+90 352 123 45 67",
      "website": "https://ornektekstil.com",
      "city": "Kayseri",
      "sector": "Tekstil",
      "employeeCount": 50,
      "foundationYear": 2010,
      "isActive": true,
      "maxUsers": 2,
      "currentUsers": 1,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Get Company by ID

Belirli bir firmayı getir.

```http
GET /api/companies/:id
```

**Response (200):**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Create Company

Yeni firma oluştur.

```http
POST /api/companies
```

**Request Body:**

```json
{
  "programId": "uuid",
  "name": "Yeni Firma A.Ş.",
  "legalName": "Yeni Firma Anonim Şirketi",
  "taxNumber": "9876543210",
  "email": "info@yenifirma.com",
  "phone": "+90 555 987 65 43",
  "city": "Kayseri",
  "sector": "Teknoloji",
  "employeeCount": 25,
  "foundationYear": 2020
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Firma başarıyla oluşturuldu"
}
```

---

### Update Company

Firmayı güncelle.

```http
PATCH /api/companies/:id
```

**Request Body:**

```json
{
  "phone": "+90 555 111 22 33",
  "employeeCount": 30
}
```

**Response (200):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Firma başarıyla güncellendi"
}
```

---

### Delete Company

Firmayı sil.

```http
DELETE /api/companies/:id
```

**Response (200):**

```json
{
  "success": true,
  "message": "Firma başarıyla silindi"
}
```

---

## 🔒 Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized access"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error message"
}
```

---

## 📊 User Roles

- `master_admin` - Tüm sistemi yöneten
- `program_manager` - Program yöneticisi
- `consultant` - Danışman
- `company_admin` - Firma yöneticisi
- `company_user` - Firma kullanıcısı
- `observer` - Gözlemci (sadece görüntüleme)

---

## 🔐 Row Level Security (RLS)

Tüm API endpoint'leri RLS politikalarına tabidir:

- **Master Admin:** Tüm kaynaklara tam erişim
- **Program Manager:** Kendi programlarına tam erişim
- **Consultant:** Atandığı programları görüntüleme
- **Company Admin:** Kendi firmasını yönetme
- **Company User:** Kendi firmasını görüntüleme

---

## 📝 Notes

- Tüm tarihler ISO 8601 formatındadır
- Pagination henüz implement edilmemiştir (yakında eklenecek)
- Rate limiting henüz aktif değildir
