'use client';

import { useState } from 'react';
import api from '../lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      const token = res.data.accessToken;
      Cookies.set('token', token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full px-4 py-2 border rounded bg-transparent"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full px-4 py-2 border rounded bg-transparent"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="w-full py-2 bg-black text-white rounded">
        Login
      </button>
    </form>
  );
}
