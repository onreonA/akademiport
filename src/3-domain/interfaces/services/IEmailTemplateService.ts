import { EmailTemplate } from '../../entities/Email';
import { Result } from '@/6-core/result/Result';

/**
 * Email Template Service Interface
 */
export interface IEmailTemplateService {
  /**
   * Get template by name
   */
  getTemplate(name: string, version?: number): Promise<Result<EmailTemplate>>;

  /**
   * Render template with variables
   */
  renderTemplate(
    templateName: string,
    variables: Record<string, any>
  ): Promise<Result<{ html: string; text?: string; subject: string }>>;

  /**
   * Compile MJML to HTML
   */
  compileMJML(mjmlContent: string): Promise<Result<string>>;

  /**
   * Validate template variables
   */
  validateVariables(templateName: string, variables: Record<string, any>): Promise<Result<boolean>>;
}
