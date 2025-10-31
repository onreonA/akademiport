import { describe, it, expect } from 'vitest';
import { Task } from './Task';

describe('Task Entity', () => {
  describe('Creation', () => {
    it('should create a valid task', () => {
      const task: Task = {
        id: 'task-1',
        subProjectId: 'subproject-1',
        assignedTo: 'user-1',
        title: 'Test Task',
        description: 'Test description',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2025-02-01'),
        completedAt: null,
        approvedAt: null,
        approvedBy: null,
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(task).toBeDefined();
      expect(task.id).toBe('task-1');
      expect(task.subProjectId).toBe('subproject-1');
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('high');
    });

    it('should create unassigned task', () => {
      const task: Task = {
        id: 'task-2',
        subProjectId: 'subproject-1',
        title: 'Unassigned Task',
        status: 'todo',
        priority: 'medium',
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(task.assignedTo).toBeUndefined();
    });
  });

  describe('Status Workflow', () => {
    it('should transition from todo to in_progress', () => {
      const task: Task = {
        id: 'task-1',
        subProjectId: 'subproject-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask: Task = { ...task, status: 'in_progress' };
      
      expect(updatedTask.status).toBe('in_progress');
    });

    it('should mark task as completed', () => {
      const task: Task = {
        id: 'task-1',
        subProjectId: 'subproject-1',
        title: 'Test Task',
        status: 'in_progress',
        priority: 'medium',
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const completedTask: Task = {
        ...task,
        status: 'completed',
        completedAt: new Date(),
      };
      
      expect(completedTask.status).toBe('completed');
      expect(completedTask.completedAt).toBeDefined();
    });

    it('should approve completed task', () => {
      const completedTask: Task = {
        id: 'task-1',
        subProjectId: 'subproject-1',
        title: 'Test Task',
        status: 'completed',
        priority: 'medium',
        completedAt: new Date(),
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const approvedTask: Task = {
        ...completedTask,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'consultant-1',
      };
      
      expect(approvedTask.status).toBe('approved');
      expect(approvedTask.approvedAt).toBeDefined();
      expect(approvedTask.approvedBy).toBe('consultant-1');
    });

    it('should reject completed task', () => {
      const completedTask: Task = {
        id: 'task-1',
        subProjectId: 'subproject-1',
        title: 'Test Task',
        status: 'completed',
        priority: 'medium',
        completedAt: new Date(),
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const rejectedTask: Task = {
        ...completedTask,
        status: 'in_progress',
        completedAt: null,
      };
      
      expect(rejectedTask.status).toBe('in_progress');
      expect(rejectedTask.completedAt).toBeNull();
    });
  });

  describe('Priority', () => {
    it('should have valid priority values', () => {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      
      validPriorities.forEach((priority) => {
        const task: Task = {
          id: 'task-1',
          subProjectId: 'subproject-1',
          title: 'Test Task',
          status: 'todo',
          priority: priority as Task['priority'],
          orderIndex: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(task.priority).toBe(priority);
      });
    });
  });

  describe('Due Date', () => {
    it('should track due date', () => {
      const dueDate = new Date('2025-02-01');
      const task: Task = {
        id: 'task-1',
        subProjectId: 'subproject-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'high',
        dueDate,
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(task.dueDate).toEqual(dueDate);
    });

    it('should identify overdue tasks', () => {
      const pastDate = new Date('2024-01-01');
      const task: Task = {
        id: 'task-1',
        subProjectId: 'subproject-1',
        title: 'Overdue Task',
        status: 'todo',
        priority: 'high',
        dueDate: pastDate,
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'completed' && task.status !== 'approved';
      
      expect(isOverdue).toBe(true);
    });
  });
});

