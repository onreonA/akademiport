import { describe, it, expect } from 'vitest';
import { SubProject } from './SubProject';

describe('SubProject Entity', () => {
  describe('Creation', () => {
    it('should create a valid sub-project', () => {
      const subProject: SubProject = {
        id: 'subproject-1',
        projectId: 'project-1',
        name: 'Test SubProject',
        description: 'Test description',
        status: 'in_progress',
        orderIndex: 1,
        progress: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(subProject).toBeDefined();
      expect(subProject.id).toBe('subproject-1');
      expect(subProject.projectId).toBe('project-1');
      expect(subProject.name).toBe('Test SubProject');
      expect(subProject.status).toBe('in_progress');
      expect(subProject.orderIndex).toBe(1);
      expect(subProject.progress).toBe(30);
    });

    it('should create sub-project with optional description', () => {
      const subProject: SubProject = {
        id: 'subproject-2',
        projectId: 'project-1',
        name: 'SubProject without description',
        status: 'todo',
        orderIndex: 2,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(subProject.description).toBeUndefined();
    });
  });

  describe('Status', () => {
    it('should have valid status values', () => {
      const validStatuses = ['todo', 'in_progress', 'review', 'done', 'cancelled'];

      validStatuses.forEach((status) => {
        const subProject: SubProject = {
          id: 'subproject-1',
          projectId: 'project-1',
          name: 'Test SubProject',
          status: status as SubProject['status'],
          orderIndex: 1,
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(subProject.status).toBe(status);
      });
    });
  });

  describe('Order', () => {
    it('should maintain order index', () => {
      const subProjects: SubProject[] = [
        {
          id: 'subproject-1',
          projectId: 'project-1',
          name: 'First',
          status: 'todo',
          orderIndex: 1,
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'subproject-2',
          projectId: 'project-1',
          name: 'Second',
          status: 'todo',
          orderIndex: 2,
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'subproject-3',
          projectId: 'project-1',
          name: 'Third',
          status: 'todo',
          orderIndex: 3,
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const sorted = [...subProjects].sort((a, b) => a.orderIndex - b.orderIndex);

      expect(sorted[0].orderIndex).toBe(1);
      expect(sorted[1].orderIndex).toBe(2);
      expect(sorted[2].orderIndex).toBe(3);
    });
  });

  describe('Progress', () => {
    it('should track progress correctly', () => {
      const subProject: SubProject = {
        id: 'subproject-1',
        projectId: 'project-1',
        name: 'Test SubProject',
        status: 'in_progress',
        orderIndex: 1,
        progress: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(subProject.progress).toBeGreaterThanOrEqual(0);
      expect(subProject.progress).toBeLessThanOrEqual(100);
    });
  });
});
