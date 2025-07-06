'use client';

import { useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import axios from 'axios';
import { isWithin15Minutes } from '../utils/time';

type CommentProps = {
  comment: CommentWithReplies;
  currentUsername?: string;
  onReplySuccess?: () => void;
};

type CommentWithReplies = {
  id: string;
  content: string;
  author: { username: string } | null;
  createdAt: string;
  replies: CommentWithReplies[];
};

export default function CommentItem({ comment, currentUsername, onReplySuccess }: CommentProps) {
  const [expanded, setExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentContent, setCurrentContent] = useState(comment.content);
  const [deleted, setDeleted] = useState(comment.content === '[deleted]');
  const [editable, setEditable] = useState(false);
  const [restorable, setRestorable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // const currentUsername =
  //   typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  useEffect(() => {
    setEditable(isWithin15Minutes(comment.createdAt));
    setRestorable(isWithin15Minutes(comment.createdAt)); // Will be used for deleted
  }, [comment.createdAt]);

  async function handleDelete() {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/comments/${comment.id}`, {
        withCredentials: true,
      });
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
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${comment.id}/restore`,
        {},
        { withCredentials: true }
      );
      setSuccessMessage('Comment restored successfully. Reloading...');
      setErrorMessage('');
      setTimeout(() => location.reload(), 1000); // Optional graceful reload
    } catch (err) {
      console.error('Restore failed', err);
      setErrorMessage('Failed to restore comment.');
      setSuccessMessage('');
    }
  }

  return (
    <div className="pl-4 border-l border-gray-300 mt-4">
      {errorMessage && <div className="alert alert-danger py-1 text-sm">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success py-1 text-sm">{successMessage}</div>}

      <div className="text-sm text-gray-700 flex justify-between items-center">
        <div>
          <span className="font-semibold">{comment.author?.username || 'Anonymous'}</span>{' '}
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>

        {comment.author?.username === currentUsername && (
        <div className="text-xs text-gray-500 space-x-2">
          {!deleted && editable && (
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className="text-blue-500 hover:underline"
            >
              {showEditForm ? 'Cancel Edit' : 'Edit'}
            </button>
          )}
          {!deleted && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
          {deleted && restorable && (
            <button
              onClick={handleRestore}
              className="text-green-500 hover:underline"
            >
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
          <p className={deleted ? 'italic text-gray-500' : ''}>
            {deleted ? '[deleted]' : currentContent}
          </p>
        )}
      </div>

      {/* Action buttons (Reply + Replies Toggle) */}
      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
        {!deleted && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="hover:underline"
          >
            {showReplyForm ? 'Cancel' : 'Reply'}
          </button>
        )}

        {comment.replies?.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="hover:underline">
            {expanded ? 'Hide replies' : `Show ${comment.replies.length} replies`}
          </button>
        )}
      </div>

      {/* Reply form */}
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

      {/* Replies */}
      {expanded && comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
