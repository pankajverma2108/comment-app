'use client';

import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';

type Notification = {
  id: string;
  read: boolean;
  createdAt: string;
  comment: {
    id: string;
    content: string;
    author: { username: string };
  };
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }

  async function markAsRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative focus:outline-none"
      >
        🔔
        {notifications.some((n) => !n.read) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded border z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b font-semibold">Notifications</div>
          <ul className="divide-y">
            {notifications.length === 0 && (
              <li className="p-4 text-sm text-gray-500">No notifications</li>
            )}
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 ${
                  !notif.read ? 'bg-gray-100 font-semibold' : ''
                }`}
                onClick={() => {
                  markAsRead(notif.id);
                  window.location.href = '/comments'; // can add #comment-id in future
                }}
              >
                <div className="text-sm">
                  <span className="text-blue-600">{notif.comment.author.username}</span>{' '}
                  replied: “{notif.comment.content.slice(0, 50)}...”
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
