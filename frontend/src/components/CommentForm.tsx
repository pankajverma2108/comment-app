'use client';

import { useState } from 'react';
import axios from 'axios';

type CommentFormProps = {
  parentId?: string;
  commentId?: string; // for editing existing comment
  initialContent?: string; // for pre-filling edit
  onSuccess?: () => void;
  currentUsername?: string;
};

export default function CommentForm({
  parentId,
  commentId,
  initialContent = '',
  onSuccess,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (commentId) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}`,
          { content },
          { withCredentials: true }
        );
        setSuccess('Comment updated successfully.');
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/comments`,
          { content, parentId },
          { withCredentials: true }
        );
        setSuccess('Comment posted successfully.');
      }

      setContent('');
      onSuccess?.();
    } catch (err: any) {
      console.error('Comment error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <div className="alert alert-danger py-2 text-sm">{error}</div>}
      {success && <div className="alert alert-success py-2 text-sm">{success}</div>}

      <textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="form-control bg-white text-black text-sm"
        required
      />
      <div className="text-right">
        <button type="submit" className="btn btn-dark btn-sm">
          {commentId ? 'Update' : 'Post'}
        </button>
      </div>
    </form>
  );
}
