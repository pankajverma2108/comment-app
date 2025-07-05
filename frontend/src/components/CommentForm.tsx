'use client';

import { useState } from 'react';
import axios from 'axios';

type CommentFormProps = {
  parentId?: string;
  commentId?: string; // for editing existing comment
  initialContent?: string; // for pre-filling edit
  onSuccess?: () => void;
};

export default function CommentForm({
  parentId,
  commentId,
  initialContent = '',
  onSuccess,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      if (commentId) {
        // PATCH for editing
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}`,
          { content },
          { withCredentials: true }
        );
      } else {
        // POST for new comment or reply
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/comments`,
          { content, parentId },
          { withCredentials: true }
        );
      }

      setContent('');
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full p-2 border rounded bg-transparent text-sm"
        required
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="text-right">
        <button
          type="submit"
          className="bg-black text-white px-4 py-1 text-sm rounded"
        >
          {commentId ? 'Update' : 'Post'}
        </button>
      </div>
    </form>
  );
}
