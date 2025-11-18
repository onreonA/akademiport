/**
 * Email Template Service
 *
 * Template yönetimi ve rendering
 */

import { IEmailTemplateService } from '@/3-domain/interfaces/services/IEmailTemplateService';
import { EmailTemplate } from '@/3-domain/entities/Email';
import { Result } from '@/6-core/result/Result';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';
import mjml from 'mjml';

export class EmailTemplateService implements IEmailTemplateService {
  /**
   * Get template by name
   */
  async getTemplate(name: string, version?: number): Promise<Result<EmailTemplate>> {
    try {
      const supabase = getSupabaseAdminClient();
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1);

      if (version) {
        query = query.eq('version', version);
      }

      const { data, error } = await query.single();

      if (error) {
        return Result.fail(new Error(`Template not found: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error: any) {
      logger.error('EmailTemplateService.getTemplate error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Render template with variables
   */
  async renderTemplate(
    templateName: string,
    variables: Record<string, any>
  ): Promise<Result<{ html: string; text?: string; subject: string }>> {
    try {
      const templateResult = await this.getTemplate(templateName);
      if (templateResult.isFailure) {
        return Result.fail(templateResult.error!);
      }

      const template = templateResult.value!;

      // Replace variables in subject
      let subject = template.subject;
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        subject = subject.replace(regex, String(variables[key]));
      });

      // Replace variables in HTML content
      let html = template.htmlContent;
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regex, String(variables[key]));
      });

      // Replace variables in text content
      let text = template.textContent;
      if (text) {
        Object.keys(variables).forEach((key) => {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          text = text!.replace(regex, String(variables[key]));
        });
      }

      // Compile MJML if exists
      if (template.mjmlContent) {
        const mjmlResult = await this.compileMJML(template.mjmlContent);
        if (mjmlResult.isSuccess) {
          // Replace variables in compiled MJML HTML
          Object.keys(variables).forEach((key) => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            html = mjmlResult.value!.replace(regex, String(variables[key]));
          });
        }
      }

      return Result.ok({
        html,
        text,
        subject,
      });
    } catch (error: any) {
      logger.error('EmailTemplateService.renderTemplate error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Compile MJML to HTML
   */
  async compileMJML(mjmlContent: string): Promise<Result<string>> {
    try {
      const { html, errors } = mjml(mjmlContent, {
        validationLevel: 'soft',
      });

      if (errors && errors.length > 0) {
        logger.warn('MJML compilation warnings:', errors);
      }

      return Result.ok(html);
    } catch (error: any) {
      logger.error('EmailTemplateService.compileMJML error:', error);
      return Result.fail(new Error(`MJML compilation failed: ${error.message}`));
    }
  }

  /**
   * Validate template variables
   */
  async validateVariables(
    templateName: string,
    variables: Record<string, any>
  ): Promise<Result<boolean>> {
    try {
      const templateResult = await this.getTemplate(templateName);
      if (templateResult.isFailure) {
        return Result.fail(templateResult.error!);
      }

      const template = templateResult.value!;
      const requiredVariables = Object.keys(template.variables || {});

      // Check if all required variables are provided
      const missingVariables = requiredVariables.filter(
        (key) => !(key in variables) || variables[key] === undefined || variables[key] === null
      );

      if (missingVariables.length > 0) {
        return Result.fail(new Error(`Missing required variables: ${missingVariables.join(', ')}`));
      }

      return Result.ok(true);
    } catch (error: any) {
      logger.error('EmailTemplateService.validateVariables error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Map database row to entity
   */
  private mapToEntity(row: any): EmailTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      subject: row.subject,
      htmlContent: row.html_content,
      textContent: row.text_content,
      mjmlContent: row.mjml_content,
      emailType: row.email_type,
      variables: row.variables || {},
      version: row.version,
      isActive: row.is_active,
      metadata: row.metadata,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
