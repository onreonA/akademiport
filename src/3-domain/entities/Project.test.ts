import { describe, it, expect } from 'vitest';
import { Project } from './Project';

describe('Project Entity', () => {
  describe('Creation', () => {
    it('should create a valid project', () => {
      const project: Project = {
        id: 'project-1',
        companyId: 'company-1',
        consultantId: 'consultant-1',
        name: 'Test Project',
        description: 'Test description',
        status: 'active',
        priority: 'high',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        progress: 50,
        isTemplate: false,
        templateId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(project).toBeDefined();
      expect(project.id).toBe('project-1');
      expect(project.name).toBe('Test Project');
      expect(project.status).toBe('active');
      expect(project.priority).toBe('high');
      expect(project.progress).toBe(50);
      expect(project.isTemplate).toBe(false);
    });

    it('should create a project template', () => {
      const template: Project = {
        id: 'template-1',
        companyId: null,
        consultantId: 'consultant-1',
        name: 'Project Template',
        description: 'Template description',
        status: 'planning',
        priority: 'medium',
        startDate: null,
        endDate: null,
        progress: 0,
        isTemplate: true,
        templateId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(template.isTemplate).toBe(true);
      expect(template.companyId).toBeNull();
      expect(template.startDate).toBeNull();
      expect(template.endDate).toBeNull();
    });

    it('should create a project from template', () => {
      const project: Project = {
        id: 'project-2',
        companyId: 'company-1',
        consultantId: 'consultant-1',
        name: 'Project from Template',
        description: 'Created from template',
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        progress: 0,
        isTemplate: false,
        templateId: 'template-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(project.isTemplate).toBe(false);
      expect(project.templateId).toBe('template-1');
      expect(project.companyId).toBe('company-1');
    });
  });

  describe('Status', () => {
    it('should have valid status values', () => {
      const validStatuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

      validStatuses.forEach((status) => {
        const project: Project = {
          id: 'project-1',
          companyId: 'company-1',
          consultantId: 'consultant-1',
          name: 'Test Project',
          status: status as Project['status'],
          priority: 'medium',
          progress: 0,
          isTemplate: false,
          templateId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(project.status).toBe(status);
      });
    });
  });

  describe('Priority', () => {
    it('should have valid priority values', () => {
      const validPriorities = ['low', 'medium', 'high', 'critical'];

      validPriorities.forEach((priority) => {
        const project: Project = {
          id: 'project-1',
          companyId: 'company-1',
          consultantId: 'consultant-1',
          name: 'Test Project',
          status: 'active',
          priority: priority as Project['priority'],
          progress: 0,
          isTemplate: false,
          templateId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(project.priority).toBe(priority);
      });
    });
  });

  describe('Progress', () => {
    it('should have progress between 0 and 100', () => {
      const project: Project = {
        id: 'project-1',
        companyId: 'company-1',
        consultantId: 'consultant-1',
        name: 'Test Project',
        status: 'active',
        priority: 'medium',
        progress: 75,
        isTemplate: false,
        templateId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(project.progress).toBeGreaterThanOrEqual(0);
      expect(project.progress).toBeLessThanOrEqual(100);
    });
  });
});
