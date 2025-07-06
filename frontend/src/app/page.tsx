// frontend/src/app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-1 w-full min-h-screen">
      {/* Left: Auth Buttons */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <div className="bg-white text-black rounded shadow p-8 space-y-4 text-center w-full max-w-md">
          <h2 className="text-2xl font-bold">Welcome</h2>
          <Link href="/login" className="btn btn-dark w-full">Login</Link>
          <Link href="/register" className="btn btn-outline-dark w-full">Register</Link>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-white h-[450px] self-center" />

      {/* Right: Title */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <h1 className="text-4xl font-bold text-white">📝 Comment App</h1>
      </div>
    </div>
  );
}
