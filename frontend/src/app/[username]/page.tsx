'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import NotificationDropdown from '../../components/NotificationDropdown';
import Alert from '../../components/Alert';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [success, setSuccess] = useState('');

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${username}`);
      setUser(res.data);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get('/comments');
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const postComment = async () => {
    try {
      await api.post('/comments', { content: commentContent });
      setCommentContent('');
      setSuccess('Comment posted!');
      fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment');
    }
  };

  useEffect(() => {
    fetchUser();
    fetchComments();
  }, [username]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!user) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="container mt-5">
      <div className="max-w-xl mx-auto bg-white text-black p-5 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-2">👤 {user.username}</h2>
        <div className="flex justify-center mt-4">
          <NotificationDropdown />
        </div>
        <p className="text-gray-600">Email: {user.email}</p>
        <p className="text-gray-400 text-sm mt-2">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </p>

        <button
          onClick={() => router.push(`/${username}/notifications`)}
          className="btn btn-outline-primary mt-4"
        >
          🔔 Notifications
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="btn btn-outline-danger mt-2"
        >
          🚪 Logout
        </button>
      </div>

      {/* Unified Comment Section with personalization */}
      <div className="max-w-xl mx-auto mt-6 p-4 bg-white text-black rounded shadow">
        <h4 className="text-lg font-semibold mb-1">
          🧵 Comments by <span className="text-blue-600">@{user.username}</span>
        </h4>
        <p className="text-gray-500 text-sm mb-3">
          Share your thoughts or reply to existing discussions below.
        </p>

        <CommentForm onSuccess={() => {}} />
        <CommentList />
      </div>


    </div>
  );
}
