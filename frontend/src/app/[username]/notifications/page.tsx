'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function UserNotificationsPage() {
  const { username } = useParams();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
      try {
        const res = await api.get(`/notifications/user/${username}`);
        setNotifications(res.data);

        // Mark all unread notifications as read
        for (const n of res.data) {
          if (!n.read) {
            await api.patch(`/notifications/${n.id}/read`);
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load notifications', err);
        setError(err.response?.data?.message || 'Failed to fetch notifications');
        setLoading(false);
      }
    };

    fetchAndMarkNotifications();
  }, [username]);

  return (
    <div className="container mt-5">
      <div className="max-w-xl mx-auto bg-white text-black p-5 rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-4">🔔 Notifications</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="list-group">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`list-group-item d-flex justify-between items-center ${
                  n.read ? '' : 'fw-bold text-primary'
                }`}
              >
                <span>{n.read ? '✅' : '🆕'} {n.comment.content}</span>
                <small className="text-muted">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
