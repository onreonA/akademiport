'use client';
import { X, User, Calendar, FileText, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onTaskAssigned: () => void;
}
interface User {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  companies?: {
    name: string;
  };
}
export default function TaskAssignmentModal({
  isOpen,
  onClose,
  task,
  onTaskAssigned,
}: TaskAssignmentModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/companies', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Flatten users from all companies
        const allUsers = data.companies.flatMap(
          (company: any) =>
            company.users?.map((user: any) => ({
              ...user,
              companies: { name: company.name },
            })) || []
        );
        setUsers(allUsers);
      }
    } catch (error) {}
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Lütfen bir kullanıcı seçin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/task-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          taskId: task.id,
          assignedTo: selectedUser,
          dueDate: dueDate || null,
          notes: notes || null,
        }),
      });
      if (response.ok) {
        onTaskAssigned();
        onClose();
        // Reset form
        setSelectedUser('');
        setDueDate('');
        setNotes('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Görev atama başarısız');
      }
    } catch (error) {
      setError('Görev atama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-bold text-gray-800'>Görev Ata</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Task Info */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <h3 className='font-semibold text-gray-800 mb-2'>
              Görev Bilgileri
            </h3>
            <p className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Başlık:</span> {task.title}
            </p>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Açıklama:</span> {task.description}
            </p>
          </div>
          {/* User Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <User className='w-4 h-4 inline mr-2' />
              Kullanıcı Seçin
            </label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            >
              <option value=''>Kullanıcı seçin...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email}) - {user.companies?.name}
                </option>
              ))}
            </select>
          </div>
          {/* Due Date */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Calendar className='w-4 h-4 inline mr-2' />
              Bitiş Tarihi
            </label>
            <input
              type='datetime-local'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <FileText className='w-4 h-4 inline mr-2' />
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Görev hakkında ek notlar...'
            />
          </div>
          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}
          {/* Actions */}
          <div className='flex space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center'
            >
              {loading ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <>
                  <Send className='w-4 h-4 mr-2' />
                  Görev Ata
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
