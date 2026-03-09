'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt with:', { email });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok && data.success) {
        console.log('Login successful, redirecting to dashboard...');
        const role = data?.data?.user?.role;
        const status = data?.data?.user?.status;

        let target = '/user/dashboard';

        if (role === 'ADMIN') {
          target = '/admin/dashboard';
        } else if (role === 'SUPERADMIN') {
          target = '/superadmin/dashboard';
        } else if (role === 'ORGANIZER') {
          if (status === 'PENDING') {
            target = '/waiting-for-approval';
          } else if (status === 'REJECTED' || status === 'SUSPENDED') {
            target = '/request-rejected';
          } else {
            target = '/organizer/dashboard';
          }
        }

        // Don't set loading to false - stay in loading state while redirecting
        window.location.href = target;
        return; // Exit early to prevent finally block
      } else {
        console.error('Login failed:', data);
        setError(data.message || data.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-4 z-40">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/70 px-7 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18),inset_1px_0_0_rgba(255,255,255,0.12),inset_-1px_0_0_rgba(255,255,255,0.12)] backdrop-blur">
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
                className="rounded-full border-thin px-4 py-2 text-sm text-white bg-white/10 transition hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full border-thin px-4 py-2 text-sm text-muted transition hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9)]"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="rounded-3xl border border-white/10 p-8 bg-black">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-soft">Welcome back</p>
              <h1 className="mt-3 text-3xl font-normal bg-gradient-to-r from-pink-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                Sign in to Eventura
              </h1>
              <p className="mt-3 text-sm text-muted">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm text-white mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@college.edu"
                  className="w-full px-4 py-3 rounded-2xl bg-black border border-white/10 text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
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
                  className="w-full px-4 py-3 rounded-2xl bg-black border border-white/10 text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full border border-neon bg-black text-neon font-medium transition hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-neon hover:underline">
                Create one
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-soft mb-3">Are you a superadmin?</p>
              <Link
                href="/login/superadmin"
                className="inline-block text-sm text-neon hover:underline font-medium"
              >
                Superadmin Login
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-xs text-soft">
            Admin-approved publishing · QR attendance · Secure access
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
