import { NextRequest, NextResponse } from 'next/server';
import { TrainingDocumentRepository } from '@/infrastructure/database/repositories/TrainingDocumentRepository';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import {
  CreateTrainingDocumentUseCase,
  ListTrainingDocumentsUseCase,
} from '@/application/use-cases/training-document';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const trainingDocumentRepository = new TrainingDocumentRepository();
const trainingRepository = new TrainingRepository();

/**
 * GET /api/trainings/[id]/documents
 * List all documents for a training
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const listDocumentsUseCase = new ListTrainingDocumentsUseCase(
      trainingDocumentRepository,
      trainingRepository
    );
    const result = await listDocumentsUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ documents: result.value });
  } catch (error) {
    console.error('Error in GET /api/trainings/[id]/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/trainings/[id]/documents
 * Create a new document for a training
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can create documents
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const createDocumentUseCase = new CreateTrainingDocumentUseCase(
      trainingDocumentRepository,
      trainingRepository
    );
    const result = await createDocumentUseCase.execute({
      trainingId: id,
      title: body.title,
      description: body.description || null,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize || null,
      fileType: body.fileType || null,
      orderIndex: body.orderIndex || 0,
      isLocked: body.isLocked || false,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/trainings/[id]/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
