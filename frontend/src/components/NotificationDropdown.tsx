'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import Link from 'next/link';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const username = localStorage.getItem('username');
      if (!username) return;

      try {
        const res = await api.get(`/notifications/user/${username}/preview`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-outline-secondary"
      >
        🔔
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow-lg rounded z-50">
          <div className="p-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-center text-gray-500">
                No recent notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="text-sm border-b p-2 flex items-start gap-2"
                >
                  {n.read ? '✅' : '🆕'} <span>{n.comment.content}</span>
                </div>
              ))
            )}
          </div>
          <div className="text-center border-t p-2">
            <Link
              href={`/${localStorage.getItem('username')}/notifications`}
              className="text-blue-600 hover:underline text-sm"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
