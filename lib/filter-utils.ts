export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  consultant: string[];
  meetingType: string[];
  priority: string[];
  searchQuery: string;
}
export interface Appointment {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  meeting_type?: string;
  preferred_date?: string;
  preferred_time?: string;
  consultant_id?: string;
  company_id?: string;
  company_name?: string;
  consultant_name?: string;
  created_at?: string;
  updated_at?: string;
}
export function filterAppointments(
  appointments: Appointment[],
  filters: FilterOptions
): Appointment[] {
  return appointments.filter(appointment => {
    // Search query filter
    if (filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase();
      const searchableFields = [
        appointment.title,
        appointment.description,
        appointment.company_name,
        appointment.consultant_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!searchableFields.includes(searchTerm)) {
        return false;
      }
    }
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const appointmentDate = appointment.preferred_date;
      if (!appointmentDate) return false;
      if (
        filters.dateRange.start &&
        appointmentDate < filters.dateRange.start
      ) {
        return false;
      }
      if (filters.dateRange.end && appointmentDate > filters.dateRange.end) {
        return false;
      }
    }
    // Status filter
    if (
      filters.status.length > 0 &&
      !filters.status.includes(appointment.status)
    ) {
      return false;
    }
    // Consultant filter
    if (
      filters.consultant.length > 0 &&
      appointment.consultant_id &&
      !filters.consultant.includes(appointment.consultant_id)
    ) {
      return false;
    }
    // Meeting type filter
    if (
      filters.meetingType.length > 0 &&
      appointment.meeting_type &&
      !filters.meetingType.includes(appointment.meeting_type)
    ) {
      return false;
    }
    // Priority filter
    if (
      filters.priority.length > 0 &&
      appointment.priority &&
      !filters.priority.includes(appointment.priority)
    ) {
      return false;
    }
    return true;
  });
}
export function sortAppointments(
  appointments: Appointment[],
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Appointment[] {
  return [...appointments].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    switch (sortBy) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      case 'priority':
        aValue = a.priority?.toLowerCase() || '';
        bValue = b.priority?.toLowerCase() || '';
        break;
      case 'preferred_date':
        aValue = a.preferred_date || '';
        bValue = b.preferred_date || '';
        break;
      case 'company_name':
        aValue = a.company_name?.toLowerCase() || '';
        bValue = b.company_name?.toLowerCase() || '';
        break;
      case 'consultant_name':
        aValue = a.consultant_name?.toLowerCase() || '';
        bValue = b.consultant_name?.toLowerCase() || '';
        break;
      case 'created_at':
      default:
        aValue = a.created_at || '';
        bValue = b.created_at || '';
        break;
    }
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}
export function getFilterStats(
  appointments: Appointment[],
  filteredAppointments: Appointment[]
) {
  const total = appointments.length;
  const filtered = filteredAppointments.length;
  const hidden = total - filtered;
  return {
    total,
    filtered,
    hidden,
    percentage: total > 0 ? Math.round((filtered / total) * 100) : 0,
  };
}
export function getStatusCounts(appointments: Appointment[]) {
  const counts: Record<string, number> = {};
  appointments.forEach(appointment => {
    const status = appointment.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
}
export function getPriorityCounts(appointments: Appointment[]) {
  const counts: Record<string, number> = {};
  appointments.forEach(appointment => {
    const priority = appointment.priority || 'unknown';
    counts[priority] = (counts[priority] || 0) + 1;
  });
  return counts;
}
export function getMeetingTypeCounts(appointments: Appointment[]) {
  const counts: Record<string, number> = {};
  appointments.forEach(appointment => {
    const type = appointment.meeting_type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}
export function getDateRange(appointments: Appointment[]) {
  if (appointments.length === 0) {
    return { min: '', max: '' };
  }
  const dates = appointments
    .map(a => a.preferred_date)
    .filter(Boolean)
    .sort();
  return {
    min: dates[0] || '',
    max: dates[dates.length - 1] || '',
  };
}
