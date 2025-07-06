'use client';

import useSWR from 'swr';
import CommentItem from './CommentItem';
import axios from 'axios';
import { useEffect, useState } from 'react';

type CommentWithReplies = {
  id: string;
  content: string;
  author: { username: string } | null;
  createdAt: string;
  replies: CommentWithReplies[];
};

const fetcher = (url: string) =>
  axios.get(url, { withCredentials: true }).then(res => res.data);

export default function CommentList() {
  const { data: comments, error, isLoading, mutate } = useSWR<CommentWithReplies[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/comments`,
    fetcher,
    {
      refreshInterval: 10000, // Optional: revalidate every 10s
    }
  );

  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
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
          onReplySuccess={mutate} // auto-refresh after reply
        />
      ))}
    </div>
  );
}
