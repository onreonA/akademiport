import { Resend } from 'resend';
// Email provider configuration
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
// Email types
export type EmailType =
  | 'appointment_created'
  | 'appointment_confirmed'
  | 'appointment_rejected'
  | 'appointment_reminder'
  | 'consultant_assigned'
  | 'education_registered'
  | 'education_reminder'
  | 'event_announcement'
  | 'forum_message'
  | 'project_task_assigned'
  | 'password_reset'
  | 'account_created'
  | 'revise_request'
  | 'revise_request_approved'
  | 'revise_request_rejected';
// Email data interface
export interface EmailData {
  to: string;
  subject: string;
  template: EmailType;
  data: Record<string, any>;
  from?: string;
}
// Email template data
export interface EmailTemplateData {
  userName?: string;
  companyName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  consultantName?: string;
  subject?: string;
  status?: string;
  meetingLink?: string;
  meetingLocation?: string;
  notes?: string;
  [key: string]: any;
}
// Email service class
export class EmailService {
  private static instance: EmailService;
  private queue: EmailData[] = [];
  private isProcessing = false;
  private constructor() {}
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }
  // Add email to queue
  public async addToQueue(emailData: EmailData): Promise<void> {
    this.queue.push(emailData);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }
  // Process email queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const emailData = this.queue.shift();
      if (emailData) {
        try {
          await this.sendEmail(emailData);
        } catch (error) {
          // Re-add to queue for retry (with limit)
          if (this.queue.length < 10) {
            this.queue.push(emailData);
          }
        }
      }
    }
    this.isProcessing = false;
  }
  // Send individual email
  private async sendEmail(emailData: EmailData): Promise<void> {
    const { to, subject, template, data, from } = emailData;
    const htmlContent = this.generateEmailTemplate(template, data);
    const fromEmail = from || 'noreply@ihracatakademi.com';
    // Check if Resend is configured
    if (!resend) {
      //   `📧 Email would be sent (Resend not configured): ${template} to ${to}`
      // );
      return;
    }
    await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      html: htmlContent,
    });
  }
  // Generate email template
  private generateEmailTemplate(
    template: EmailType,
    data: EmailTemplateData
  ): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>İhracat Akademi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { background: #6b7280; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 5px; }
          .status-confirmed { color: #059669; font-weight: bold; }
          .status-rejected { color: #dc2626; font-weight: bold; }
          .status-pending { color: #d97706; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>İhracat Akademi</h1>
          </div>
          <div class="content">
            ${this.getTemplateContent(template, data)}
          </div>
          <div class="footer">
            <p>Bu email İhracat Akademi sistemi tarafından gönderilmiştir.</p>
            <p>© 2025 İhracat Akademi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return baseTemplate;
  }
  // Get template content based on type
  private getTemplateContent(
    template: EmailType,
    data: EmailTemplateData
  ): string {
    switch (template) {
      case 'appointment_created':
        return `
          <h2>Randevu Talebiniz Alındı</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Randevu talebiniz başarıyla alınmıştır. Detaylar aşağıdadır:</p>
          <ul>
            <li><strong>Konu:</strong> ${data.subject || 'Belirtilmemiş'}</li>
            <li><strong>Tarih:</strong> ${data.appointmentDate || 'Belirtilmemiş'}</li>
            <li><strong>Saat:</strong> ${data.appointmentTime || 'Belirtilmemiş'}</li>
            <li><strong>Durum:</strong> <span class="status-pending">Beklemede</span></li>
          </ul>
          <p>Randevunuz onaylandığında size bilgilendirme yapılacaktır.</p>
        `;
      case 'appointment_confirmed':
        return `
          <h2>Randevunuz Onaylandı</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Randevu talebiniz onaylanmıştır. Detaylar aşağıdadır:</p>
          <ul>
            <li><strong>Konu:</strong> ${data.subject || 'Belirtilmemiş'}</li>
            <li><strong>Tarih:</strong> ${data.appointmentDate || 'Belirtilmemiş'}</li>
            <li><strong>Saat:</strong> ${data.appointmentTime || 'Belirtilmemiş'}</li>
            <li><strong>Danışman:</strong> ${data.consultantName || 'Atanacak'}</li>
            <li><strong>Durum:</strong> <span class="status-confirmed">Onaylandı</span></li>
            ${data.meetingLink ? `<li><strong>Toplantı Linki:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></li>` : ''}
            ${data.meetingLocation ? `<li><strong>Toplantı Yeri:</strong> ${data.meetingLocation}</li>` : ''}
          </ul>
          ${data.notes ? `<p><strong>Notlar:</strong> ${data.notes}</p>` : ''}
        `;
      case 'appointment_rejected':
        return `
          <h2>Randevu Talebiniz Reddedildi</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Maalesef randevu talebiniz reddedilmiştir.</p>
          <ul>
            <li><strong>Konu:</strong> ${data.subject || 'Belirtilmemiş'}</li>
            <li><strong>Tarih:</strong> ${data.appointmentDate || 'Belirtilmemiş'}</li>
            <li><strong>Durum:</strong> <span class="status-rejected">Reddedildi</span></li>
          </ul>
          ${data.notes ? `<p><strong>Red Nedeni:</strong> ${data.notes}</p>` : ''}
          <p>Yeni bir randevu talebi oluşturabilirsiniz.</p>
        `;
      case 'appointment_reminder':
        return `
          <h2>Randevu Hatırlatması</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Yarın randevunuz bulunmaktadır. Detaylar aşağıdadır:</p>
          <ul>
            <li><strong>Konu:</strong> ${data.subject || 'Belirtilmemiş'}</li>
            <li><strong>Tarih:</strong> ${data.appointmentDate || 'Belirtilmemiş'}</li>
            <li><strong>Saat:</strong> ${data.appointmentTime || 'Belirtilmemiş'}</li>
            <li><strong>Danışman:</strong> ${data.consultantName || 'Belirtilmemiş'}</li>
            ${data.meetingLink ? `<li><strong>Toplantı Linki:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></li>` : ''}
            ${data.meetingLocation ? `<li><strong>Toplantı Yeri:</strong> ${data.meetingLocation}</li>` : ''}
          </ul>
          <p>Randevunuza zamanında katılmayı unutmayın.</p>
        `;
      case 'consultant_assigned':
        return `
          <h2>Danışman Atandı</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Randevunuza danışman atanmıştır:</p>
          <ul>
            <li><strong>Danışman:</strong> ${data.consultantName || 'Belirtilmemiş'}</li>
            <li><strong>Konu:</strong> ${data.subject || 'Belirtilmemiş'}</li>
            <li><strong>Tarih:</strong> ${data.appointmentDate || 'Belirtilmemiş'}</li>
            <li><strong>Saat:</strong> ${data.appointmentTime || 'Belirtilmemiş'}</li>
          </ul>
          <p>Danışmanınızla iletişime geçebilirsiniz.</p>
        `;
      case 'revise_request':
        return `
          <h2>Randevu Revize Talebi</h2>
          <p>Sayın ${data.consultantName || 'Değerli Danışman'},</p>
          <p>Bir randevu revize talebi alındı:</p>
          <ul>
            <li><strong>Firma:</strong> ${data.companyName || 'Belirtilmemiş'}</li>
            <li><strong>Randevu Konusu:</strong> ${data.appointmentTitle || 'Belirtilmemiş'}</li>
            <li><strong>Mevcut Tarih:</strong> ${data.originalDate || 'Belirtilmemiş'}</li>
            <li><strong>Mevcut Saat:</strong> ${data.originalTime || 'Belirtilmemiş'}</li>
            <li><strong>Talep Edilen Tarih:</strong> ${data.requestedDate || 'Belirtilmemiş'}</li>
            <li><strong>Talep Edilen Saat:</strong> ${data.requestedTime || 'Belirtilmemiş'}</li>
            <li><strong>Revize Sebebi:</strong> ${data.reason || 'Belirtilmemiş'}</li>
          </ul>
          ${data.additionalNotes ? `<p><strong>Ek Notlar:</strong> ${data.additionalNotes}</p>` : ''}
          <p>Bu talebi değerlendirmek için admin paneline giriş yapabilirsiniz.</p>
        `;
      case 'revise_request_approved':
        return `
          <h2>Revize Talebiniz Onaylandı</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Randevu revize talebiniz onaylanmıştır:</p>
          <ul>
            <li><strong>Randevu Konusu:</strong> ${data.appointmentTitle || 'Belirtilmemiş'}</li>
            <li><strong>Yeni Tarih:</strong> ${data.newDate || 'Belirtilmemiş'}</li>
            <li><strong>Yeni Saat:</strong> ${data.newTime || 'Belirtilmemiş'}</li>
          </ul>
          ${data.reviewNotes ? `<p><strong>Admin Notu:</strong> ${data.reviewNotes}</p>` : ''}
          <p>Randevunuz yeni tarih ve saatte planlanmıştır.</p>
        `;
      case 'revise_request_rejected':
        return `
          <h2>Revize Talebiniz Reddedildi</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Maalesef randevu revize talebiniz reddedilmiştir:</p>
          <ul>
            <li><strong>Randevu Konusu:</strong> ${data.appointmentTitle || 'Belirtilmemiş'}</li>
            <li><strong>Mevcut Tarih:</strong> ${data.originalDate || 'Belirtilmemiş'}</li>
            <li><strong>Mevcut Saat:</strong> ${data.originalTime || 'Belirtilmemiş'}</li>
          </ul>
          ${data.reviewNotes ? `<p><strong>Red Nedeni:</strong> ${data.reviewNotes}</p>` : ''}
          <p>Randevunuz mevcut tarih ve saatte geçerlidir.</p>
        `;
      default:
        return `
          <h2>Bildirim</h2>
          <p>Sayın ${data.userName || 'Değerli Kullanıcı'},</p>
          <p>Bu bir sistem bildirimidir.</p>
        `;
    }
  }
  // Convenience methods for specific email types
  public async sendAppointmentCreated(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Randevu Talebiniz Alındı - İhracat Akademi',
      template: 'appointment_created',
      data,
    });
  }
  public async sendAppointmentConfirmed(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Randevunuz Onaylandı - İhracat Akademi',
      template: 'appointment_confirmed',
      data,
    });
  }
  public async sendAppointmentRejected(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Randevu Talebiniz Reddedildi - İhracat Akademi',
      template: 'appointment_rejected',
      data,
    });
  }
  public async sendAppointmentReminder(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Randevu Hatırlatması - İhracat Akademi',
      template: 'appointment_reminder',
      data,
    });
  }
  public async sendConsultantAssigned(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Danışman Atandı - İhracat Akademi',
      template: 'consultant_assigned',
      data,
    });
  }
  public async sendReviseRequest(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Randevu Revize Talebi - İhracat Akademi',
      template: 'revise_request',
      data,
    });
  }
  public async sendReviseRequestApproved(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Revize Talebiniz Onaylandı - İhracat Akademi',
      template: 'revise_request_approved',
      data,
    });
  }
  public async sendReviseRequestRejected(
    to: string,
    data: EmailTemplateData
  ): Promise<void> {
    await this.addToQueue({
      to,
      subject: 'Revize Talebiniz Reddedildi - İhracat Akademi',
      template: 'revise_request_rejected',
      data,
    });
  }
}
// Export singleton instance
export const emailService = EmailService.getInstance();
