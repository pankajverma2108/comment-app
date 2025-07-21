'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import NotificationDropdown from '../../components/NotificationDropdown';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';
import axios from 'axios';

// Define a type for the user object to avoid using 'any'
interface User {
  username: string;
  email: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  
  // Use the User type here. It can be User or null before it's fetched.
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  // Wrap fetchUser in useCallback so it doesn't change on every render
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get(`/users/${username}`);
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Safely handle potential axios errors
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to load profile');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  }, [username]); // It only needs to be re-created if the username changes

  useEffect(() => {
    if (username) {
      fetchUser();
    }
  }, [username, fetchUser]); // Add fetchUser to the dependency array

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

      {/* The Comment components will handle their own data fetching and posting */}
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