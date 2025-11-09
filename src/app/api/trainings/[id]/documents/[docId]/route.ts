import { NextRequest, NextResponse } from 'next/server';
import { TrainingDocumentRepository } from '@/infrastructure/database/repositories/TrainingDocumentRepository';
import {
  UpdateTrainingDocumentUseCase,
  DeleteTrainingDocumentUseCase,
} from '@/application/use-cases/training-document';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';

const trainingDocumentRepository = new TrainingDocumentRepository();

/**
 * GET /api/trainings/[id]/documents/[docId]
 * Get training document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docId } = await params;
    const document = await trainingDocumentRepository.findById(docId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    logger.error('Error in GET /api/trainings/[id]/documents/[docId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/trainings/[id]/documents/[docId]
 * Update training document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can update documents
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { docId } = await params;
    const body = await request.json();

    const updateDocumentUseCase = new UpdateTrainingDocumentUseCase(trainingDocumentRepository);
    const result = await updateDocumentUseCase.execute(docId, {
      title: body.title,
      description: body.description,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      fileType: body.fileType,
      orderIndex: body.orderIndex,
      isLocked: body.isLocked,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in PUT /api/trainings/[id]/documents/[docId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/trainings/[id]/documents/[docId]
 * Delete training document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can delete documents
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { docId } = await params;

    const deleteDocumentUseCase = new DeleteTrainingDocumentUseCase(trainingDocumentRepository);
    const result = await deleteDocumentUseCase.execute(docId);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/trainings/[id]/documents/[docId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
