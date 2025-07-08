'use client';

import useSWR from 'swr';
import CommentItem from './CommentItem';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import api from '@/lib/api';

type CommentWithReplies = {
  id: string;
  content: string;
  author: { username: string } | null;
  createdAt: string;
  replies: CommentWithReplies[];
};

// const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CommentList() {
  const { data: comments, error, isLoading, mutate } = useSWR<CommentWithReplies[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/comments`,
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      console.log('Current user from localStorage:', username);
      setCurrentUsername(username);
    }
  }, []);

  if (isLoading) return <p>Loading comments...</p>;
  if (error) return <p className="text-red-500">Failed to load comments.</p>;

  return (
    <div className="space-y-4 mt-6">
      {comments?.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUsername={currentUsername ?? undefined}
          onReplySuccess={mutate}
        />
      ))}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Post a Comment</h3>
        <CommentForm onSuccess={mutate} />
      </div>
    </div>
  );
}
