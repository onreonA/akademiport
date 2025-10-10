/**
 * Rol Bazlı Erişim Kontrolü (RBAC) Modülü
 * 
 * Bu modül, kullanıcı rollerine göre erişim kontrolü yapmak için kullanılır.
 */

// Rol tanımları
export const ROLES = {
  // Admin roller
  ADMIN: 'admin',
  MASTER_ADMIN: 'master_admin',
  CONSULTANT: 'danisman',
  
  // Firma roller
  COMPANY_ADMIN: 'firma_admin',
  COMPANY_USER: 'firma_kullanici',
  
  // Diğer roller
  OBSERVER: 'gozlemci',
};

// Rol grupları
export const ROLE_GROUPS = {
  ADMIN_ROLES: [ROLES.ADMIN, ROLES.MASTER_ADMIN, ROLES.CONSULTANT],
  COMPANY_ROLES: [ROLES.COMPANY_ADMIN, ROLES.COMPANY_USER],
  OBSERVER_ROLES: [ROLES.OBSERVER],
};

// İzin tanımları
export const PERMISSIONS = {
  // Proje yönetimi
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ASSIGN: 'project:assign',
  
  // Alt proje yönetimi
  SUBPROJECT_CREATE: 'subproject:create',
  SUBPROJECT_READ: 'subproject:read',
  SUBPROJECT_UPDATE: 'subproject:update',
  SUBPROJECT_DELETE: 'subproject:delete',
  SUBPROJECT_ASSIGN: 'subproject:assign',
  
  // Görev yönetimi
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_COMPLETE: 'task:complete',
  TASK_APPROVE: 'task:approve',
  
  // Firma yönetimi
  COMPANY_CREATE: 'company:create',
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  
  // Kullanıcı yönetimi
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Eğitim yönetimi
  EDUCATION_CREATE: 'education:create',
  EDUCATION_READ: 'education:read',
  EDUCATION_UPDATE: 'education:update',
  EDUCATION_DELETE: 'education:delete',
  EDUCATION_ASSIGN: 'education:assign',
  
  // Döküman yönetimi
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_ASSIGN: 'document:assign',
  
  // Haber yönetimi
  NEWS_CREATE: 'news:create',
  NEWS_READ: 'news:read',
  NEWS_UPDATE: 'news:update',
  NEWS_DELETE: 'news:delete',
  
  // Forum yönetimi
  FORUM_CREATE_CATEGORY: 'forum:create_category',
  FORUM_UPDATE_CATEGORY: 'forum:update_category',
  FORUM_DELETE_CATEGORY: 'forum:delete_category',
  FORUM_CREATE_TOPIC: 'forum:create_topic',
  FORUM_UPDATE_TOPIC: 'forum:update_topic',
  FORUM_DELETE_TOPIC: 'forum:delete_topic',
  FORUM_CREATE_REPLY: 'forum:create_reply',
  FORUM_UPDATE_REPLY: 'forum:update_reply',
  FORUM_DELETE_REPLY: 'forum:delete_reply',
  
  // Sistem yönetimi
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
};

// Rol-İzin matrisi
export const ROLE_PERMISSIONS = {
  // Admin roller
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MASTER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.CONSULTANT]: [
    // Proje yönetimi
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_ASSIGN,
    
    // Alt proje yönetimi
    PERMISSIONS.SUBPROJECT_CREATE,
    PERMISSIONS.SUBPROJECT_READ,
    PERMISSIONS.SUBPROJECT_UPDATE,
    PERMISSIONS.SUBPROJECT_ASSIGN,
    
    // Görev yönetimi
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_APPROVE,
    
    // Firma yönetimi
    PERMISSIONS.COMPANY_READ,
    
    // Kullanıcı yönetimi
    PERMISSIONS.USER_READ,
    
    // Eğitim yönetimi
    PERMISSIONS.EDUCATION_READ,
    PERMISSIONS.EDUCATION_ASSIGN,
    
    // Döküman yönetimi
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_ASSIGN,
    
    // Forum yönetimi
    PERMISSIONS.FORUM_CREATE_TOPIC,
    PERMISSIONS.FORUM_UPDATE_TOPIC,
    PERMISSIONS.FORUM_CREATE_REPLY,
    PERMISSIONS.FORUM_UPDATE_REPLY,
  ],
  
  // Firma roller
  [ROLES.COMPANY_ADMIN]: [
    // Proje yönetimi
    PERMISSIONS.PROJECT_READ,
    
    // Alt proje yönetimi
    PERMISSIONS.SUBPROJECT_READ,
    
    // Görev yönetimi
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_COMPLETE,
    
    // Firma yönetimi
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.COMPANY_UPDATE,
    
    // Kullanıcı yönetimi
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    
    // Eğitim yönetimi
    PERMISSIONS.EDUCATION_READ,
    
    // Döküman yönetimi
    PERMISSIONS.DOCUMENT_READ,
    
    // Forum yönetimi
    PERMISSIONS.FORUM_CREATE_TOPIC,
    PERMISSIONS.FORUM_CREATE_REPLY,
  ],
  [ROLES.COMPANY_USER]: [
    // Proje yönetimi
    PERMISSIONS.PROJECT_READ,
    
    // Alt proje yönetimi
    PERMISSIONS.SUBPROJECT_READ,
    
    // Görev yönetimi
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_COMPLETE,
    
    // Firma yönetimi
    PERMISSIONS.COMPANY_READ,
    
    // Eğitim yönetimi
    PERMISSIONS.EDUCATION_READ,
    
    // Döküman yönetimi
    PERMISSIONS.DOCUMENT_READ,
    
    // Forum yönetimi
    PERMISSIONS.FORUM_CREATE_TOPIC,
    PERMISSIONS.FORUM_CREATE_REPLY,
  ],
  
  // Diğer roller
  [ROLES.OBSERVER]: [
    // Proje yönetimi
    PERMISSIONS.PROJECT_READ,
    
    // Alt proje yönetimi
    PERMISSIONS.SUBPROJECT_READ,
    
    // Görev yönetimi
    PERMISSIONS.TASK_READ,
    
    // Firma yönetimi
    PERMISSIONS.COMPANY_READ,
    
    // Eğitim yönetimi
    PERMISSIONS.EDUCATION_READ,
    
    // Döküman yönetimi
    PERMISSIONS.DOCUMENT_READ,
    
    // Forum yönetimi
    PERMISSIONS.FORUM_CREATE_REPLY,
  ],
};

/**
 * Kullanıcının belirtilen izne sahip olup olmadığını kontrol eder
 * @param role - Kullanıcı rolü
 * @param permission - Kontrol edilecek izin
 * @returns İzin varsa true, yoksa false
 */
export function hasPermission(role: string, permission: string): boolean {
  if (!role || !permission) return false;
  
  // Rol-izin matrisinde kontrol et
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  return permissions.includes(permission);
}

/**
 * Kullanıcının belirtilen izinlerden en az birine sahip olup olmadığını kontrol eder
 * @param role - Kullanıcı rolü
 * @param permissions - Kontrol edilecek izinler
 * @returns En az bir izin varsa true, yoksa false
 */
export function hasAnyPermission(role: string, permissions: string[]): boolean {
  if (!role || !permissions || permissions.length === 0) return false;
  
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Kullanıcının belirtilen izinlerin tümüne sahip olup olmadığını kontrol eder
 * @param role - Kullanıcı rolü
 * @param permissions - Kontrol edilecek izinler
 * @returns Tüm izinler varsa true, yoksa false
 */
export function hasAllPermissions(role: string, permissions: string[]): boolean {
  if (!role || !permissions || permissions.length === 0) return false;
  
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Kullanıcının belirtilen rol grubunda olup olmadığını kontrol eder
 * @param role - Kullanıcı rolü
 * @param roleGroup - Kontrol edilecek rol grubu
 * @returns Rol grupta varsa true, yoksa false
 */
export function isInRoleGroup(role: string, roleGroup: string[]): boolean {
  if (!role || !roleGroup || roleGroup.length === 0) return false;
  
  return roleGroup.includes(role);
}

/**
 * Kullanıcının admin rolüne sahip olup olmadığını kontrol eder
 * @param role - Kullanıcı rolü
 * @returns Admin rolüne sahipse true, değilse false
 */
export function isAdmin(role: string): boolean {
  return isInRoleGroup(role, ROLE_GROUPS.ADMIN_ROLES);
}

/**
 * Kullanıcının firma rolüne sahip olup olmadığını kontrol eder
 * @param role - Kullanıcı rolü
 * @returns Firma rolüne sahipse true, değilse false
 */
export function isCompanyUser(role: string): boolean {
  return isInRoleGroup(role, ROLE_GROUPS.COMPANY_ROLES);
}

/**
 * Kullanıcının gözlemci rolüne sahip olup olmadığını kontrol eder
 * @param role - Kullanıcı rolü
 * @returns Gözlemci rolüne sahipse true, değilse false
 */
export function isObserver(role: string): boolean {
  return isInRoleGroup(role, ROLE_GROUPS.OBSERVER_ROLES);
}
