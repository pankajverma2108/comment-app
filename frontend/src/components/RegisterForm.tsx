'use client';

import { useState } from 'react';
import api from '../lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Alert from './Alert';
import axios from 'axios';

export default function RegisterForm() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/register', form);
      const token = res.data.accessToken;
      Cookies.set('token', token);

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  }

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-5 shadow-md rounded space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

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
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
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

        <button type="submit" className="btn btn-primary w-full">
          Register
        </button>
      </form>
    </div>
  );
}
