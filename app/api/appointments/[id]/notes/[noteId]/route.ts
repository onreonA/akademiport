import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// PUT - Not güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { id: appointmentId, noteId } = await params;
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { content } = body;
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    const supabase = createClient();
    // Get the note to check permissions
    const { data: note, error: noteError } = await supabase
      .from('appointment_notes')
      .select('*')
      .eq('id', noteId)
      .eq('appointment_id', appointmentId)
      .single();
    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    // Check permissions
    if (note.note_type === 'company') {
      // Check if user created this note
      if (note.created_by !== userEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (note.note_type === 'admin' || note.note_type === 'consultant') {
      // Check if user is admin
      if (userEmail !== 'admin@ihracatakademi.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    // Update note
    const { data: updatedNote, error: updateError } = await supabase
      .from('appointment_notes')
      .update({
        content: content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      note: updatedNote,
      message: 'Not başarıyla güncellendi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// DELETE - Not sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { id: appointmentId, noteId } = await params;
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    const supabase = createClient();
    // Get the note to check permissions
    const { data: note, error: noteError } = await supabase
      .from('appointment_notes')
      .select('*')
      .eq('id', noteId)
      .eq('appointment_id', appointmentId)
      .single();
    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    // Check permissions
    if (note.note_type === 'company') {
      // Check if user created this note
      if (note.created_by !== userEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (note.note_type === 'admin' || note.note_type === 'consultant') {
      // Check if user is admin
      if (userEmail !== 'admin@ihracatakademi.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    // Delete note
    const { error: deleteError } = await supabase
      .from('appointment_notes')
      .delete()
      .eq('id', noteId);
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Not başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
