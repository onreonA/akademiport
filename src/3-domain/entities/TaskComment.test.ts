import { describe, it, expect } from 'vitest';
import { TaskComment } from './TaskComment';

describe('TaskComment Entity', () => {
  describe('Creation', () => {
    it('should create a valid comment', () => {
      const comment: TaskComment = {
        id: 'comment-1',
        taskId: 'task-1',
        userId: 'user-1',
        comment: 'This is a test comment',
        isQuestion: false,
        createdAt: new Date(),
      };

      expect(comment).toBeDefined();
      expect(comment.id).toBe('comment-1');
      expect(comment.taskId).toBe('task-1');
      expect(comment.userId).toBe('user-1');
      expect(comment.comment).toBe('This is a test comment');
      expect(comment.isQuestion).toBe(false);
    });

    it('should create a question comment', () => {
      const question: TaskComment = {
        id: 'comment-2',
        taskId: 'task-1',
        userId: 'user-1',
        comment: 'How should I approach this task?',
        isQuestion: true,
        createdAt: new Date(),
      };

      expect(question.isQuestion).toBe(true);
    });
  });

  describe('Comment Type', () => {
    it('should differentiate between comments and questions', () => {
      const comment: TaskComment = {
        id: 'comment-1',
        taskId: 'task-1',
        userId: 'user-1',
        comment: 'Regular comment',
        isQuestion: false,
        createdAt: new Date(),
      };

      const question: TaskComment = {
        id: 'comment-2',
        taskId: 'task-1',
        userId: 'user-2',
        comment: 'Question comment?',
        isQuestion: true,
        createdAt: new Date(),
      };

      expect(comment.isQuestion).toBe(false);
      expect(question.isQuestion).toBe(true);
    });
  });

  describe('Chronological Order', () => {
    it('should maintain chronological order by createdAt', () => {
      const comments: TaskComment[] = [
        {
          id: 'comment-1',
          taskId: 'task-1',
          userId: 'user-1',
          comment: 'First comment',
          isQuestion: false,
          createdAt: new Date('2025-01-01T10:00:00'),
        },
        {
          id: 'comment-2',
          taskId: 'task-1',
          userId: 'user-2',
          comment: 'Second comment',
          isQuestion: false,
          createdAt: new Date('2025-01-01T11:00:00'),
        },
        {
          id: 'comment-3',
          taskId: 'task-1',
          userId: 'user-1',
          comment: 'Third comment',
          isQuestion: false,
          createdAt: new Date('2025-01-01T12:00:00'),
        },
      ];

      const sorted = [...comments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      expect(sorted[0].id).toBe('comment-1');
      expect(sorted[1].id).toBe('comment-2');
      expect(sorted[2].id).toBe('comment-3');
    });
  });

  describe('Task Association', () => {
    it('should group comments by task', () => {
      const comments: TaskComment[] = [
        {
          id: 'comment-1',
          taskId: 'task-1',
          userId: 'user-1',
          comment: 'Comment on task 1',
          isQuestion: false,
          createdAt: new Date(),
        },
        {
          id: 'comment-2',
          taskId: 'task-1',
          userId: 'user-2',
          comment: 'Another comment on task 1',
          isQuestion: false,
          createdAt: new Date(),
        },
        {
          id: 'comment-3',
          taskId: 'task-2',
          userId: 'user-1',
          comment: 'Comment on task 2',
          isQuestion: false,
          createdAt: new Date(),
        },
      ];

      const task1Comments = comments.filter((c) => c.taskId === 'task-1');
      const task2Comments = comments.filter((c) => c.taskId === 'task-2');

      expect(task1Comments).toHaveLength(2);
      expect(task2Comments).toHaveLength(1);
    });
  });
});
