'use client';
import { Dialog } from '@headlessui/react';
import React, { useState, useEffect } from 'react';
interface Note {
  id: string;
  note_type: 'company' | 'admin' | 'consultant';
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  userEmail: string;
  isAdmin?: boolean;
}
export default function NotesModal({
  isOpen,
  onClose,
  appointmentId,
  userEmail,
  isAdmin = false,
}: NotesModalProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'company' | 'admin' | 'consultant'>(
    'company'
  );
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  // Notları getir
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/notes`, {
        headers: {
          'X-User-Email': userEmail,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // Not ekle
  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          noteType,
          content: newNote.trim(),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
        setNoteType('company');
      }
    } catch (error) {}
  };
  // Not güncelle
  const updateNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    try {
      const response = await fetch(
        `/api/appointments/${appointmentId}/notes/${noteId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail,
          },
          body: JSON.stringify({
            content: editContent.trim(),
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNotes(notes.map(note => (note.id === noteId ? data.note : note)));
        setEditingNote(null);
        setEditContent('');
      }
    } catch (error) {}
  };
  // Not sil
  const deleteNote = async (noteId: string) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(
        `/api/appointments/${appointmentId}/notes/${noteId}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Email': userEmail,
          },
        }
      );
      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
      }
    } catch (error) {}
  };
  // Tarih formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  // Not türü rengi
  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'company':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'consultant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  // Not türü etiketi
  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'company':
        return 'Firma';
      case 'admin':
        return 'Admin';
      case 'consultant':
        return 'Danışman';
      default:
        return type;
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, appointmentId]);
  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <Dialog.Panel className='w-full max-w-2xl bg-white rounded-xl shadow-xl'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <Dialog.Title className='text-xl font-semibold text-gray-900'>
              Randevu Notları
            </Dialog.Title>
            <button
              onClick={onClose}
              className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
            >
              <i className='ri-close-line text-gray-500 text-lg'></i>
            </button>
          </div>
          {/* Content */}
          <div className='p-6'>
            {/* Yeni Not Ekleme */}
            <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center gap-3 mb-3'>
                <label className='text-sm font-medium text-gray-700'>
                  Not Türü:
                </label>
                <select
                  value={noteType}
                  onChange={e => setNoteType(e.target.value as any)}
                  className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='company'>Firma Notu</option>
                  {isAdmin && (
                    <>
                      <option value='admin'>Admin Notu</option>
                      <option value='consultant'>Danışman Notu</option>
                    </>
                  )}
                </select>
              </div>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder='Notunuzu buraya yazın...'
                className='w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                rows={3}
              />
              <div className='flex justify-end mt-3'>
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Not Ekle
                </button>
              </div>
            </div>
            {/* Notlar Listesi */}
            <div className='space-y-4'>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                  <p className='text-gray-500 mt-2'>Notlar yükleniyor...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <i className='ri-file-text-line text-4xl mb-2'></i>
                  <p>Henüz not eklenmemiş</p>
                </div>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    {/* Not Header */}
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(note.note_type)}`}
                        >
                          {getNoteTypeLabel(note.note_type)}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {note.created_by}
                        </span>
                        <span className='text-sm text-gray-400'>
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      {/* Actions */}
                      <div className='flex items-center gap-1'>
                        {(note.created_by === userEmail || isAdmin) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingNote(note.id);
                                setEditContent(note.content);
                              }}
                              className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
                              title='Düzenle'
                            >
                              <i className='ri-edit-line text-sm'></i>
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                              title='Sil'
                            >
                              <i className='ri-delete-bin-line text-sm'></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Not Content */}
                    {editingNote === note.id ? (
                      <div className='space-y-3'>
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className='w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          rows={3}
                        />
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => updateNote(note.id)}
                            className='px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors'
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setEditContent('');
                            }}
                            className='px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 transition-colors'
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className='text-gray-700 whitespace-pre-wrap'>
                        {note.content}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
