'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push('/superadmin/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center hover:opacity-80 transition" aria-label="Home">
            <Image
              src="/branding/logo_dark_no_bg..svg"
              alt="Eventura"
              width={144}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border-thin px-4 py-2 text-sm text-muted transition hover:text-white"
            >
              Regular Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="glass card-glow rounded-3xl border-strong p-8">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-soft">Restricted Access</p>
              <h1 className="mt-3 text-3xl font-normal">Superadmin Login</h1>
              <p className="mt-3 text-sm text-muted">
                Enter your superadmin credentials
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm text-white mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin"
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-white mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full border-strong bg-white/10 text-white font-medium transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in as Superadmin'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-neon hover:underline">
                ← Back to regular login
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-xs text-soft">
            Admin-approved publishing · QR attendance · Secure access
          </div>
        </div>
      </div>
    </div>
  );
}
