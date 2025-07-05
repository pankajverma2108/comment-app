'use client';

import { useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import axios from 'axios';

type CommentProps = {
  comment: CommentWithReplies;
  onReplySuccess?: () => void;
};

type CommentWithReplies = {
  id: string;
  content: string;
  author: { username: string } | null;
  createdAt: string;
  replies: CommentWithReplies[];
};

export default function CommentItem({ comment, onReplySuccess }: CommentProps) {
  const [expanded, setExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentContent, setCurrentContent] = useState(comment.content);
  const [deleted, setDeleted] = useState(comment.content === '[deleted]');
  const [editable, setEditable] = useState(false);
  const [restorable, setRestorable] = useState(false);

  const currentUsername =
    typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  useEffect(() => {
    const created = new Date(comment.createdAt).getTime();
    const now = Date.now();
    const diffMinutes = (now - created) / (1000 * 60);
    setEditable(diffMinutes < 15);
    setRestorable(diffMinutes < 15);
  }, [comment.createdAt]);

  async function handleDelete() {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/comments/${comment.id}`, {
        withCredentials: true,
      });
      setCurrentContent('[deleted]');
      setDeleted(true);
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  async function handleRestore() {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${comment.id}/restore`,
        {},
        { withCredentials: true }
      );
      location.reload(); // Optional: re-fetch instead of reload
    } catch (err) {
      console.error('Restore failed', err);
    }
  }

  return (
    <div className="pl-4 border-l border-gray-300 mt-4">
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
          <p>{currentContent}</p>
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
