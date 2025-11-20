/**
 * Integration Tests for /api/trainings/[id]/documents
 *
 * Tests training document API routes with authentication, authorization, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

// Mock all dependencies before importing the route
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockListTrainingDocumentsExecute = vi.fn();
const mockCreateTrainingDocumentExecute = vi.fn();

vi.mock('@/application/use-cases/training-document', () => ({
  ListTrainingDocumentsUseCase: class {
    execute = mockListTrainingDocumentsExecute;
  },
  CreateTrainingDocumentUseCase: class {
    execute = mockCreateTrainingDocumentExecute;
  },
}));

describe('GET /api/trainings/[id]/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1/documents');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns documents successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockDocuments = [
      {
        id: 'doc-1',
        trainingId: 'training-1',
        title: 'Test Document',
        fileUrl: 'https://example.com/doc.pdf',
        fileName: 'doc.pdf',
        orderIndex: 0,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockListTrainingDocumentsExecute.mockResolvedValue({
      isFailure: false,
      value: mockDocuments,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1/documents');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.documents).toHaveLength(1);
    expect(data.documents[0].id).toBe('doc-1');
    expect(data.documents[0].title).toBe('Test Document');
    expect(mockListTrainingDocumentsExecute).toHaveBeenCalledWith('training-1');
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListTrainingDocumentsExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Training not found', statusCode: 404 },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/non-existent/documents');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Training not found');
  });
});

describe('POST /api/trainings/[id]/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1/documents', {
      method: 'POST',
      body: {
        title: 'Test Document',
        fileUrl: 'https://example.com/doc.pdf',
        fileName: 'doc.pdf',
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not authorized', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1/documents', {
      method: 'POST',
      body: {
        title: 'Test Document',
        fileUrl: 'https://example.com/doc.pdf',
        fileName: 'doc.pdf',
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('creates document successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockCreateTrainingDocumentExecute.mockResolvedValue({
      isFailure: false,
      value: { id: 'doc-1' },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1/documents', {
      method: 'POST',
      body: {
        title: 'Test Document',
        fileUrl: 'https://example.com/doc.pdf',
        fileName: 'doc.pdf',
        orderIndex: 0,
        isLocked: false,
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe('doc-1');
    expect(mockCreateTrainingDocumentExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        trainingId: 'training-1',
        title: 'Test Document',
        fileUrl: 'https://example.com/doc.pdf',
        fileName: 'doc.pdf',
      })
    );
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockCreateTrainingDocumentExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Training not found', statusCode: 404 },
    });

    const { POST } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/trainings/non-existent/documents',
      {
        method: 'POST',
        body: {
          title: 'Test Document',
          fileUrl: 'https://example.com/doc.pdf',
          fileName: 'doc.pdf',
        },
      }
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Training not found');
  });
});
