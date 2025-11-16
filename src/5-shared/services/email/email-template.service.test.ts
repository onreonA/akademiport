import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailTemplateService } from './email-template.service';
import { EmailType } from '@/3-domain/enums/EmailEnums';

// Mock Supabase
vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  getSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: {
                    id: 'template-id',
                    name: 'test-template',
                    subject: 'Test Subject {{name}}',
                    html_content: '<p>Hello {{name}}</p>',
                    text_content: 'Hello {{name}}',
                    email_type: 'transactional',
                    variables: { name: 'Name' },
                    version: 1,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  error: null,
                })),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
}));

// Mock MJML
vi.mock('mjml', () => ({
  default: vi.fn((mjmlContent: string) => ({
    html: '<html><body>Compiled HTML</body></html>',
    errors: [],
  })),
}));

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;

  beforeEach(() => {
    service = new EmailTemplateService();
    vi.clearAllMocks();
  });

  describe('getTemplate', () => {
    it('should get template by name', async () => {
      const result = await service.getTemplate('test-template');
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.name).toBe('test-template');
        expect(result.value.subject).toBe('Test Subject {{name}}');
      }
    });
  });

  describe('renderTemplate', () => {
    it('should render template with variables', async () => {
      const result = await service.renderTemplate('test-template', { name: 'John' });
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.subject).toBe('Test Subject John');
        expect(result.value.html).toContain('Hello John');
      }
    });
  });

  describe('compileMJML', () => {
    it('should compile MJML to HTML', async () => {
      const mjmlContent = '<mjml><mj-body><mj-text>Hello</mj-text></mj-body></mjml>';
      const result = await service.compileMJML(mjmlContent);
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toContain('Compiled HTML');
      }
    });
  });

  describe('validateVariables', () => {
    it('should validate template variables', async () => {
      const result = await service.validateVariables('test-template', { name: 'John' });
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(true);
      }
    });

    it('should fail if required variables are missing', async () => {
      const result = await service.validateVariables('test-template', {});
      expect(result.isFailure).toBe(true);
    });
  });
});
