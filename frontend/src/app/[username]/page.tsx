'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import NotificationDropdown from '../../components/NotificationDropdown';


export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${username}`);
        setUser(res.data);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      }
    };

    fetchUser();
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
      </div>
    </div>
  );
}
