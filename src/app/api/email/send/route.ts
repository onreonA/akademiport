/**
 * Email Send API Route
 *
 * POST /api/email/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { EmailSendOptions } from '@/3-domain/entities/Email';
import type { EmailPriority } from '@/3-domain/enums/EmailEnums';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  toName: z.union([z.string(), z.array(z.string())]).optional(),
  subject: z.string().min(1).max(500),
  html: z.string().optional(),
  text: z.string().optional(),
  templateName: z.string().optional(),
  templateVariables: z.record(z.string(), z.any()).optional(),
  from: z.string().email().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  scheduledAt: z.string().datetime().optional(),
  queue: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json({ message: 'Skipped during build' }, { status: 200 });
    }

    // Lazy import to avoid build-time execution
    const { EmailService } = await import('@/5-shared/services/email');
    const { createClient } = await import('@/4-infrastructure/database/supabase-server');

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validation = sendEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const emailService = new EmailService();

    // Prepare email options
    const emailOptions: EmailSendOptions = {
      to: data.to,
      toName: data.toName,
      subject: data.subject,
      html: data.html,
      text: data.text,
      templateName: data.templateName,
      templateVariables: data.templateVariables,
      from: data.from,
      fromName: data.fromName,
      replyTo: data.replyTo,
      priority: data.priority as EmailPriority | undefined,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      trackingEnabled: true,
    };

    // Send email or queue it
    if (data.queue || data.scheduledAt) {
      const queueResult = await emailService.queue(emailOptions);
      if (queueResult.isFailure) {
        return NextResponse.json(
          { error: 'Failed to queue email', message: queueResult.error!.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        queueId: queueResult.value,
        message: 'Email queued successfully',
      });
    } else {
      // Send directly
      if (data.templateName) {
        const sendResult = await emailService.sendTemplate(
          data.templateName,
          data.to,
          data.templateVariables || {},
          emailOptions
        );

        if (sendResult.isFailure) {
          return NextResponse.json(
            { error: 'Failed to send email', message: sendResult.error!.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          sendgridMessageId: sendResult.value!.sendgridMessageId,
          message: 'Email sent successfully',
        });
      } else {
        const sendResult = await emailService.send(emailOptions);

        if (sendResult.isFailure) {
          return NextResponse.json(
            { error: 'Failed to send email', message: sendResult.error!.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          sendgridMessageId: sendResult.value!.sendgridMessageId,
          message: 'Email sent successfully',
        });
      }
    }
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
