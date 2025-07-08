'use client';

import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import Link from 'next/link';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) return;

    setUsername(user);

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/user/${user}/preview`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-outline-secondary"
      >
        🔔
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow-lg rounded z-50 border">
          <div className="p-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-center text-muted">
                No recent notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="text-sm border-bottom p-2 d-flex gap-2 align-items-start"
                >
                  <span className="me-1">
                    {n.read ? '✅' : '🆕'}
                  </span>
                  <span className="text-dark">
                    {n.comment?.content || '[Deleted]'}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="text-center border-top p-2">
            {username && (
              <Link
                href={`/${username}/notifications`}
                className="text-primary text-sm hover:underline"
              >
                View All
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
