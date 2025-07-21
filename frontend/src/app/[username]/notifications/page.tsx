'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Alert from '../../../components/Alert';
import axios from 'axios';

type NotificationItem = {
  id: string;
  createdAt: string;
  read: boolean;
  comment: {
    id: string;
    content: string;
  };
};

export default function NotificationsPage() {
  const { username } = useParams();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/user/${username}`);
        setNotifications(res.data);
      } catch (err) { // <-- FIX THIS BLOCK
        console.error('Error fetching notifications:', err);
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.message || 'Failed to load notifications');
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    const markAsRead = async () => {
      try {
        await api.patch(`/notifications/user/${username}`);
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
        // no need to block UI
      }
    };

    fetchNotifications();
    markAsRead(); // Fire & forget
  }, [username]);

  return (
    <div className="container mt-5">
      <h2 className="text-2xl font-bold mb-4 text-center">🔔 Your Notifications</h2>

      {loading && <p className="text-center">Loading...</p>}
      {error && <Alert type="error" message={error} />}

      {!loading && notifications.length === 0 && (
        <p className="text-center text-muted">No notifications found.</p>
      )}

      <ul className="list-group">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`list-group-item d-flex justify-content-between align-items-start ${
              notif.read ? 'bg-light' : 'bg-white'
            }`}
          >
            <div>
              <div className="fw-bold">You received a reply</div>
              <small className="text-muted">
                {new Date(notif.createdAt).toLocaleString()}
              </small>
              <p className="mb-0 mt-1 text-sm text-dark">
                <i>{notif.comment?.content || '[Deleted]'}</i>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button
      onClick={() => {
          localStorage.removeItem('username');
          localStorage.removeItem('token'); // if applicable
          window.location.href = '/login';
        }}
        className="btn btn-outline-danger mt-4 d-block mx-auto"
      >
        🚪 Logout
      </button>

    </div>
  );
}
