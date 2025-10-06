export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  rejectedAppointments: number;
  completedAppointments: number;
  totalCompanies: number;
  totalConsultants: number;
  averageResponseTime: number;
  completionRate: number;
}
export interface ChartData {
  monthlyTrends: {
    labels: string[];
    data: number[];
  };
  statusDistribution: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  consultantPerformance: {
    labels: string[];
    data: number[];
  };
  meetingTypeDistribution: {
    labels: string[];
    data: number[];
    colors: string[];
  };
}
export interface RecentActivity {
  id: string;
  type:
    | 'appointment_created'
    | 'appointment_confirmed'
    | 'appointment_rejected'
    | 'consultant_assigned';
  title: string;
  description: string;
  timestamp: string;
  companyName?: string;
  consultantName?: string;
}
export class AnalyticsService {
  private static instance: AnalyticsService;
  private constructor() {}
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  public calculateDashboardStats(
    appointments: any[],
    companies: any[],
    consultants: any[]
  ): DashboardStats {
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(
      a => a.status === 'pending'
    ).length;
    const confirmedAppointments = appointments.filter(
      a => a.status === 'confirmed'
    ).length;
    const rejectedAppointments = appointments.filter(
      a => a.status === 'rejected'
    ).length;
    const completedAppointments = appointments.filter(
      a => a.status === 'completed'
    ).length;
    const totalCompanies = companies.length;
    const totalConsultants = consultants.length;
    // Calculate completion rate
    const completionRate =
      totalAppointments > 0
        ? Math.round((completedAppointments / totalAppointments) * 100)
        : 0;
    // Calculate average response time (mock data for now)
    const averageResponseTime = 2.5; // hours
    return {
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      rejectedAppointments,
      completedAppointments,
      totalCompanies,
      totalConsultants,
      averageResponseTime,
      completionRate,
    };
  }
  public generateChartData(appointments: any[], consultants: any[]): ChartData {
    // Monthly trends (last 6 months)
    const monthlyTrends = this.generateMonthlyTrends(appointments);
    // Status distribution
    const statusDistribution = this.generateStatusDistribution(appointments);
    // Consultant performance
    const consultantPerformance = this.generateConsultantPerformance(
      appointments,
      consultants
    );
    // Meeting type distribution
    const meetingTypeDistribution =
      this.generateMeetingTypeDistribution(appointments);
    return {
      monthlyTrends,
      statusDistribution,
      consultantPerformance,
      meetingTypeDistribution,
    };
  }
  private generateMonthlyTrends(appointments: any[]) {
    const months = [];
    const data = [];
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
      months.push(monthName);
      // Count appointments for this month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = appointments.filter(apt => {
        const aptDate = new Date(apt.created_at || apt.preferred_date);
        return aptDate >= monthStart && aptDate <= monthEnd;
      }).length;
      data.push(count);
    }
    return {
      labels: months,
      data: data,
    };
  }
  private generateStatusDistribution(appointments: any[]) {
    const statusCounts = {
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      rejected: appointments.filter(a => a.status === 'rejected').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };
    return {
      labels: ['Beklemede', 'Onaylandı', 'Reddedildi', 'Tamamlandı'],
      data: [
        statusCounts.pending,
        statusCounts.confirmed,
        statusCounts.rejected,
        statusCounts.completed,
      ],
      colors: ['#F59E0B', '#10B981', '#EF4444', '#3B82F6'],
    };
  }
  private generateConsultantPerformance(
    appointments: any[],
    consultants: any[]
  ) {
    const consultantStats = consultants.map(consultant => {
      const consultantAppointments = appointments.filter(
        apt => apt.consultant_id === consultant.id
      );
      const completedAppointments = consultantAppointments.filter(
        apt => apt.status === 'completed'
      ).length;
      return {
        name: consultant.full_name,
        completed: completedAppointments,
        total: consultantAppointments.length,
      };
    });
    // Sort by completion rate and take top 5
    const sortedConsultants = consultantStats
      .sort((a, b) => {
        const rateA = a.total > 0 ? a.completed / a.total : 0;
        const rateB = b.total > 0 ? b.completed / b.total : 0;
        return rateB - rateA;
      })
      .slice(0, 5);
    return {
      labels: sortedConsultants.map(c => c.name),
      data: sortedConsultants.map(c =>
        c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0
      ),
    };
  }
  private generateMeetingTypeDistribution(appointments: any[]) {
    const typeCounts = {
      online: appointments.filter(a => a.meeting_type === 'online').length,
      in_person: appointments.filter(a => a.meeting_type === 'in_person')
        .length,
      phone: appointments.filter(a => a.meeting_type === 'phone').length,
    };
    return {
      labels: ['Online', 'Yüz Yüze', 'Telefon'],
      data: [typeCounts.online, typeCounts.in_person, typeCounts.phone],
      colors: ['#8B5CF6', '#F59E0B', '#10B981'],
    };
  }
  public generateRecentActivity(
    appointments: any[],
    companies: any[],
    consultants: any[]
  ): RecentActivity[] {
    const activities: RecentActivity[] = [];
    // Convert appointments to activities
    appointments.slice(0, 10).forEach(apt => {
      const company = companies.find(c => c.id === apt.company_id);
      const consultant = consultants.find(c => c.id === apt.consultant_id);
      activities.push({
        id: apt.id,
        type: 'appointment_created',
        title: `Yeni Randevu: ${apt.title}`,
        description: `${company?.name || 'Firma'} tarafından randevu talebi oluşturuldu`,
        timestamp: apt.created_at,
        companyName: company?.name,
        consultantName: consultant?.full_name,
      });
      if (apt.status === 'confirmed') {
        activities.push({
          id: `${apt.id}-confirmed`,
          type: 'appointment_confirmed',
          title: `Randevu Onaylandı: ${apt.title}`,
          description: `${apt.title} randevusu onaylandı`,
          timestamp: apt.updated_at,
          companyName: company?.name,
          consultantName: consultant?.full_name,
        });
      }
      if (apt.consultant_id) {
        activities.push({
          id: `${apt.id}-assigned`,
          type: 'consultant_assigned',
          title: `Danışman Atandı: ${apt.title}`,
          description: `${consultant?.full_name || 'Danışman'} atandı`,
          timestamp: apt.updated_at,
          companyName: company?.name,
          consultantName: consultant?.full_name,
        });
      }
    });
    // Sort by timestamp and return latest 10
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);
  }
  public getActivityIcon(type: string): string {
    switch (type) {
      case 'appointment_created':
        return 'ri-calendar-add-line';
      case 'appointment_confirmed':
        return 'ri-check-line';
      case 'appointment_rejected':
        return 'ri-close-line';
      case 'consultant_assigned':
        return 'ri-user-star-line';
      default:
        return 'ri-notification-line';
    }
  }
  public getActivityColor(type: string): string {
    switch (type) {
      case 'appointment_created':
        return 'text-blue-600';
      case 'appointment_confirmed':
        return 'text-green-600';
      case 'appointment_rejected':
        return 'text-red-600';
      case 'consultant_assigned':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  }
}
// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
