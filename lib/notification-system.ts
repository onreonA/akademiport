// Notification System Helper Functions

export interface NotificationData {
  type:
    | 'assignment_created'
    | 'assignment_locked'
    | 'assignment_revoked'
    | 'project_completed'
    | 'task_completed'
    | 'system_alert';
  title: string;
  message: string;
  companyIds: string[];
  projectId?: string;
  subProjectId?: string;
  data?: any;
}

// Send notification to companies
export async function sendNotification(notificationData: NotificationData) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return true;
  } catch (error) {
    return false;
  }
}

// Notification templates
export const NotificationTemplates = {
  assignmentCreated: (projectName: string, companyName: string) => ({
    type: 'assignment_created' as const,
    title: 'Yeni Proje Atandı',
    message: `${companyName} firmasına "${projectName}" projesi atanmıştır.`,
  }),

  assignmentLocked: (projectName: string, companyName: string) => ({
    type: 'assignment_locked' as const,
    title: 'Proje Yetkisi Kaldırıldı',
    message: `${companyName} firmasının "${projectName}" projesine erişimi kilitlenmiştir. Geçmiş işlemler görüntülenebilir.`,
  }),

  assignmentRevoked: (projectName: string, companyName: string) => ({
    type: 'assignment_revoked' as const,
    title: 'Proje Erişimi Kaldırıldı',
    message: `${companyName} firmasının "${projectName}" projesine erişimi tamamen kaldırılmıştır.`,
  }),

  subProjectAutoAssigned: (
    projectName: string,
    subProjectName: string,
    companyName: string
  ) => ({
    type: 'assignment_created' as const,
    title: 'Ana Proje Otomatik Atandı',
    message: `${companyName} firmasına "${subProjectName}" alt projesi atandığı için "${projectName}" ana projesi otomatik olarak atanmıştır.`,
  }),

  projectCompleted: (projectName: string, companyName: string) => ({
    type: 'project_completed' as const,
    title: 'Proje Tamamlandı',
    message: `${companyName} firmasının "${projectName}" projesi başarıyla tamamlanmıştır.`,
  }),

  taskCompleted: (
    taskName: string,
    projectName: string,
    companyName: string
  ) => ({
    type: 'task_completed' as const,
    title: 'Görev Tamamlandı',
    message: `${companyName} firması "${projectName}" projesindeki "${taskName}" görevini tamamlamıştır.`,
  }),

  systemAlert: (message: string) => ({
    type: 'system_alert' as const,
    title: 'Sistem Bildirimi',
    message,
  }),
};

// Bulk notification functions
export async function notifyAssignmentCreated(
  projectId: string,
  subProjectId: string | null,
  companyIds: string[],
  projectName: string,
  subProjectName?: string
) {
  const notificationData: NotificationData = {
    ...NotificationTemplates.assignmentCreated(
      subProjectName ? `${projectName} - ${subProjectName}` : projectName,
      'Seçili Firmalar'
    ),
    companyIds,
    projectId,
    subProjectId: subProjectId || undefined,
    data: {
      projectName,
      subProjectName,
      assignmentType: subProjectId ? 'sub_project' : 'project',
    },
  };

  return await sendNotification(notificationData);
}

export async function notifyAssignmentLocked(
  projectId: string,
  subProjectId: string | null,
  companyIds: string[],
  projectName: string,
  subProjectName?: string
) {
  const notificationData: NotificationData = {
    ...NotificationTemplates.assignmentLocked(
      subProjectName ? `${projectName} - ${subProjectName}` : projectName,
      'Seçili Firmalar'
    ),
    companyIds,
    projectId,
    subProjectId: subProjectId || undefined,
    data: {
      projectName,
      subProjectName,
      assignmentType: subProjectId ? 'sub_project' : 'project',
    },
  };

  return await sendNotification(notificationData);
}

export async function notifyAssignmentRevoked(
  projectId: string,
  subProjectId: string | null,
  companyIds: string[],
  projectName: string,
  subProjectName?: string
) {
  const notificationData: NotificationData = {
    ...NotificationTemplates.assignmentRevoked(
      subProjectName ? `${projectName} - ${subProjectName}` : projectName,
      'Seçili Firmalar'
    ),
    companyIds,
    projectId,
    subProjectId: subProjectId || undefined,
    data: {
      projectName,
      subProjectName,
      assignmentType: subProjectId ? 'sub_project' : 'project',
    },
  };

  return await sendNotification(notificationData);
}

export async function notifyParentProjectAutoAssigned(
  projectId: string,
  subProjectId: string,
  companyIds: string[],
  projectName: string,
  subProjectName: string
) {
  const notificationData: NotificationData = {
    ...NotificationTemplates.subProjectAutoAssigned(
      projectName,
      subProjectName,
      'Seçili Firmalar'
    ),
    companyIds,
    projectId,
    subProjectId,
    data: {
      projectName,
      subProjectName,
      autoAssigned: true,
    },
  };

  return await sendNotification(notificationData);
}

// Notification status helpers
export function getNotificationIcon(type: string) {
  switch (type) {
    case 'assignment_created':
      return '🎯';
    case 'assignment_locked':
      return '🔒';
    case 'assignment_revoked':
      return '❌';
    case 'project_completed':
      return '✅';
    case 'task_completed':
      return '📋';
    case 'system_alert':
      return '⚠️';
    default:
      return '📢';
  }
}

export function getNotificationColor(type: string) {
  switch (type) {
    case 'assignment_created':
      return 'text-green-600 bg-green-100';
    case 'assignment_locked':
      return 'text-yellow-600 bg-yellow-100';
    case 'assignment_revoked':
      return 'text-red-600 bg-red-100';
    case 'project_completed':
      return 'text-blue-600 bg-blue-100';
    case 'task_completed':
      return 'text-purple-600 bg-purple-100';
    case 'system_alert':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Notification formatting helpers
export function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return 'Az önce';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} saat önce`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} gün önce`;
  }
}

export function getNotificationActionUrl(notification: any) {
  if (notification.project_id) {
    return `/firma/proje-yonetimi/${notification.project_id}`;
  }
  return '/firma';
}
