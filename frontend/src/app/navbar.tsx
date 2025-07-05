'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import NotificationDropdown from '../components/NotificationDropdown';

export default function Navbar() {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAuthenticated(!!Cookies.get('token'));
  }, []);

  const logout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  return (
    <nav className="w-full px-6 py-4 border-b shadow-sm bg-white flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-black transition">
          🏠 Home
        </Link>

        {authenticated && (
          <Link href="/comments" className="text-gray-700 hover:text-black transition">
            💬 Comments
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {authenticated ? (
          <>
            <NotificationDropdown />
            <button
              onClick={logout}
              className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm text-blue-600 hover:underline"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
