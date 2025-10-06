'use client';
import React from 'react';
import { RiMessageLine } from 'react-icons/ri';
interface CommentsTabProps {
  comments: any[];
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onAddComment: () => void;
}
const CommentsTab: React.FC<CommentsTabProps> = React.memo(
  ({ comments, newComment, onNewCommentChange, onAddComment }) => {
    return (
      <div className='space-y-6'>
        {/* Add Comment Form */}
        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Yorum Ekle
          </h3>
          <div className='space-y-4'>
            <textarea
              value={newComment}
              onChange={e => onNewCommentChange(e.target.value)}
              placeholder='Yorumunuzu buraya yazın...'
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              rows={4}
            />
            <div className='flex justify-end'>
              <button
                onClick={onAddComment}
                disabled={!newComment.trim()}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200'
              >
                Yorum Ekle
              </button>
            </div>
          </div>
        </div>
        {/* Comments List */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>Yorumlar</h3>
          {comments.length === 0 ? (
            <div className='text-center py-12'>
              <RiMessageLine className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Henüz yorum yok
              </h3>
              <p className='text-gray-500'>İlk yorumu siz ekleyin!</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {comments.map(comment => (
                <div
                  key={comment.id}
                  className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'
                >
                  <div className='flex items-start space-x-3'>
                    <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0'>
                      <span className='text-white text-sm font-medium'>
                        {comment.user_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <span className='text-sm font-medium text-gray-900'>
                          {comment.user_name}
                        </span>
                        <span className='text-xs text-gray-500'>•</span>
                        <span className='text-xs text-gray-500'>
                          {comment.created_at}
                        </span>
                      </div>
                      <p className='text-sm text-gray-700 leading-relaxed'>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
CommentsTab.displayName = 'CommentsTab';
export default CommentsTab;
