'use client';

import { useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import axios from 'axios';
import { isWithin15Minutes } from '../utils/time';
import api from '@/lib/api';

type CommentProps = {
  comment: CommentWithReplies;
  currentUsername?: string;
  onReplySuccess?: () => void;
  level?: number;
};

type CommentWithReplies = {
  id: string;
  content: string;
  author: { username: string } | null;
  createdAt: string;
  replies: CommentWithReplies[];
};

export default function CommentItem({
  comment,
  currentUsername,
  onReplySuccess,
  level = 0,
}: CommentProps) {
  const [expanded, setExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentContent, setCurrentContent] = useState(comment.content);
  const [deleted, setDeleted] = useState(comment.content === '[deleted]');
  const [editable, setEditable] = useState(false);
  const [restorable, setRestorable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setEditable(isWithin15Minutes(comment.createdAt));
    setRestorable(isWithin15Minutes(comment.createdAt));
    console.log('🔐 Token in localStorage:', localStorage.getItem('token'));
  }, [comment.createdAt]);

  const trimmedAuthor = comment.author?.username?.trim() ?? '';
  const trimmedCurrent = currentUsername?.trim() ?? '';

  const isAuthor = true;

  // console.log('Author match check:', {
  //   commentAuthor: trimmedAuthor,
  //   currentUsername: trimmedCurrent,
  //   match: isAuthor,
  // });

 async function handleDelete() {
  try {
    await api.delete(`/comments/${comment.id}`);
    setCurrentContent('[deleted]');
    setDeleted(true);
    setSuccessMessage('Comment deleted successfully.');
    setErrorMessage('');
  } catch (err) {
    console.error('Delete failed', err);
    setErrorMessage('Failed to delete comment.');
    setSuccessMessage('');
  }
}

async function handleRestore() {
  try {
    await api.patch(`/comments/${comment.id}/restore`);
    setSuccessMessage('Comment restored successfully. Reloading...');
    setErrorMessage('');
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    console.error('Restore failed', err);
    setErrorMessage('Failed to restore comment.');
    setSuccessMessage('');
  }
}

  // console.log('🧠 Comment ID:', comment.id);
  // console.log('👤 Comment Author:', comment.author?.username);
  // console.log('🙋‍♂️ Logged in user:', currentUsername);
  // console.log('✍️ Is author:', isAuthor);

  return (
    <div
      className="mt-4 bg-white text-black p-3 rounded"
      style={{ marginLeft: `${level * 20}px` }}
    >
      {errorMessage && <div className="alert alert-danger py-1 text-sm">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success py-1 text-sm">{successMessage}</div>}

      <div className="text-sm text-gray-700 flex justify-between items-center">
        <div>
          <span className="font-semibold">{comment.author?.username || 'Anonymous'}</span>{' '}
          <span className="text-xs text-gray-800">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>

        {isAuthor && (
          <div className="text-xs text-gray-800 space-x-2">
            {!deleted && editable && (
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="text-blue-500 hover:underline"
              >
                {showEditForm ? 'Cancel Edit' : 'Edit'}
              </button>
            )}
            {!deleted && (
              <button onClick={handleDelete} className="text-red-500 hover:underline">
                Delete
              </button>
            )}
            {deleted && restorable && (
              <button onClick={handleRestore} className="text-green-500 hover:underline">
                Restore
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-1">
        {showEditForm ? (
          <CommentForm
            initialContent={currentContent}
            commentId={comment.id}
            onSuccess={() => {
              setShowEditForm(false);
              onReplySuccess?.();
            }}
          />
        ) : (
          <p className={deleted ? 'italic text-gray-800' : ''}>
            {deleted ? '[deleted]' : currentContent}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1 text-xs text-gray-800">
        {!deleted && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="hover:underline">
            {showReplyForm ? 'Cancel' : 'Reply'}
          </button>
        )}

        {comment.replies?.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="hover:underline">
            {expanded ? 'Hide replies' : `Show ${comment.replies.length} replies`}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-2">
          <CommentForm
            parentId={comment.id}
            onSuccess={() => {
              setShowReplyForm(false);
              onReplySuccess?.();
            }}
          />
        </div>
      )}

      {expanded && comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUsername={currentUsername}
              onReplySuccess={onReplySuccess}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
