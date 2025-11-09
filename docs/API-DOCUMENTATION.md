# API Documentation Guide

OpenAPI/Swagger dokümantasyonu için rehber.

## Erişim

API dokümantasyonu şu adresten erişilebilir:

- Development: `http://localhost:3000/api-docs`
- Production: `https://your-domain.com/api-docs`

## OpenAPI Spec

OpenAPI specification JSON formatında şu adresten erişilebilir:

- `/api/openapi.json`

## API Route'larına Dokümantasyon Ekleme

API route dosyalarınıza JSDoc yorumları ekleyerek dokümantasyon oluşturabilirsiniz:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  // Implementation
}
```

## Schema Tanımlama

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [master_admin, consultant, program_manager, company_user]
 *         full_name:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */
```

## Örnekler

### GET Request

```typescript
/**
 * @swagger
 * /api/programs/{id}:
 *   get:
 *     summary: Get program by ID
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Program details
 *       404:
 *         description: Program not found
 */
```

### POST Request

```typescript
/**
 * @swagger
 * /api/programs:
 *   post:
 *     summary: Create a new program
 *     tags: [Programs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Program created
 *       400:
 *         description: Invalid input
 */
```

## Test Etme

Swagger UI üzerinden API endpoint'lerini test edebilirsiniz:

1. `/api-docs` sayfasına gidin
2. Endpoint'i seçin
3. "Try it out" butonuna tıklayın
4. Parametreleri doldurun
5. "Execute" butonuna tıklayın

## Notlar

- JSDoc yorumları API route dosyalarının üstüne eklenmelidir
- OpenAPI 3.0.0 formatı kullanılmaktadır
- Authentication için bearer token veya cookie kullanılabilir
- Schema'lar `components/schemas` altında tanımlanmalıdır
