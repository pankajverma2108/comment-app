'use client';

import { useState } from 'react';
import api from '../lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Alert from './Alert';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/login', form);
      const token = res.data.accessToken;
      Cookies.set('token', token);

      const { username } = res.data.user;
      localStorage.setItem('username', username);
      localStorage.setItem('token', token); 

      setSuccess('Login successful! Redirecting...');
      setError('');
      console.log('Login success, token set.');

      setTimeout(() => {
        router.push(`/${username}`);
      }, 1500);
    } catch (err: any) {
      console.error('Login error:', err);
      setSuccess('');
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-5 shadow-md rounded space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="form-control"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="form-control"
          required
        />

        <button type="submit" className="btn btn-dark w-full">
          Login
        </button>
      </form>
    </div>
  );
}
