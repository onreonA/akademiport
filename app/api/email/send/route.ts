import { NextRequest, NextResponse } from 'next/server';

import { emailService, EmailTemplateData } from '@/lib/email-service';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data, subject } = body;
    // Validation
    if (!to || !template) {
      return NextResponse.json(
        { error: 'Email adresi ve template türü gereklidir' },
        { status: 400 }
      );
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Geçersiz email adresi' },
        { status: 400 }
      );
    }
    // Send email based on template type
    switch (template) {
      case 'appointment_created':
        await emailService.sendAppointmentCreated(
          to,
          data as EmailTemplateData
        );
        break;
      case 'appointment_confirmed':
        await emailService.sendAppointmentConfirmed(
          to,
          data as EmailTemplateData
        );
        break;
      case 'appointment_rejected':
        await emailService.sendAppointmentRejected(
          to,
          data as EmailTemplateData
        );
        break;
      case 'appointment_reminder':
        await emailService.sendAppointmentReminder(
          to,
          data as EmailTemplateData
        );
        break;
      case 'consultant_assigned':
        await emailService.sendConsultantAssigned(
          to,
          data as EmailTemplateData
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Geçersiz template türü' },
          { status: 400 }
        );
    }
    return NextResponse.json(
      { message: 'Email başarıyla gönderildi' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Email gönderilirken hata oluştu' },
      { status: 500 }
    );
  }
}
// Test endpoint for development
export async function GET() {
  return NextResponse.json(
    {
      message: 'Email API aktif',
      availableTemplates: [
        'appointment_created',
        'appointment_confirmed',
        'appointment_rejected',
        'appointment_reminder',
        'consultant_assigned',
      ],
    },
    { status: 200 }
  );
}
