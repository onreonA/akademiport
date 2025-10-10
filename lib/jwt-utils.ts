import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export interface JWTUser {
  id: string;
  email: string;
  role: string;
  company_id?: string;
  exp: number;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * JWT token'dan kullanıcı bilgilerini çıkar
 */
export async function verifyJWTToken(request: NextRequest): Promise<JWTUser | null> {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return null;
    }

    const { payload } = await jwtVerify(authToken, JWT_SECRET);
    const decoded = payload as JWTUser;

    // Token süresi kontrolü
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * API route'ları için authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<JWTUser> {
  const user = await verifyJWTToken(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Admin yetkisi kontrolü
 */
export async function requireAdmin(request: NextRequest): Promise<JWTUser> {
  const user = await requireAuth(request);
  
  const adminRoles = ['admin', 'master_admin', 'danisman'];
  if (!adminRoles.includes(user.role)) {
    throw new Error('Admin access required');
  }
  
  return user;
}

/**
 * Company yetkisi kontrolü
 */
export async function requireCompany(request: NextRequest): Promise<JWTUser> {
  const user = await requireAuth(request);
  
  const companyRoles = ['firma_admin', 'firma_kullanici'];
  if (!companyRoles.includes(user.role)) {
    throw new Error('Company access required');
  }
  
  return user;
}

/**
 * API route'ları için güvenli error handling
 */
export function createAuthErrorResponse(error: string, status: number = 401) {
  return NextResponse.json(
    { error, success: false },
    { status }
  );
}

/**
 * Company kullanıcısının belirli bir company_id'ye erişimi var mı kontrol et
 */
export async function requireCompanyAccess(
  request: NextRequest, 
  targetCompanyId?: string
): Promise<JWTUser> {
  const user = await requireCompany(request);
  
  // Admin kullanıcılar tüm company'lere erişebilir
  const adminRoles = ['admin', 'master_admin', 'danisman'];
  if (adminRoles.includes(user.role)) {
    return user;
  }
  
  // Company kullanıcısı sadece kendi company'sine erişebilir
  if (targetCompanyId && user.company_id !== targetCompanyId) {
    throw new Error('Company access denied');
  }
  
  return user;
}
