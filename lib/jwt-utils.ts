import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface JWTUser {
  id: string;
  email: string;
  role: string;
  company_id?: string;
  exp: number;
}

/**
 * JWT token'dan kullanıcı bilgilerini çıkar
 */
export function verifyJWTToken(request: NextRequest): JWTUser | null {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return null;
    }

    const decoded = jwt.verify(
      authToken, 
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as JWTUser;

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
export function requireAuth(request: NextRequest): JWTUser {
  const user = verifyJWTToken(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Admin yetkisi kontrolü
 */
export function requireAdmin(request: NextRequest): JWTUser {
  const user = requireAuth(request);
  
  const adminRoles = ['admin', 'master_admin', 'danisman'];
  if (!adminRoles.includes(user.role)) {
    throw new Error('Admin access required');
  }
  
  return user;
}

/**
 * Company yetkisi kontrolü
 */
export function requireCompany(request: NextRequest): JWTUser {
  const user = requireAuth(request);
  
  const companyRoles = ['firma_admin', 'firma_kullanici'];
  if (!companyRoles.includes(user.role)) {
    throw new Error('Company access required');
  }
  
  return user;
}
