'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    collegeName: '',
    firstName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error && !success) return;
    const timer = window.setTimeout(() => {
      setError('');
      setSuccess(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [error, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/contact/admin-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ collegeName: '', firstName: '', email: '', password: '' });
      } else {
        setError(data.message || 'Failed to submit request');
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
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full border-strong bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          {/* Info Card */}
          <div className="glass card-glow rounded-3xl border-strong p-8 mb-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-soft">Request Admin Access</p>
              <h1 className="mt-3 text-3xl font-normal">Become a College Admin</h1>
              <p className="mt-3 text-sm text-muted">
                Submit your college details to request admin access. Our SUPERADMIN team will review your request.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass card-glow rounded-3xl border-strong p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-normal mb-3">Request Submitted!</h2>
                <p className="text-muted mb-6">
                  Your admin request has been submitted successfully. You will receive an email once it's reviewed.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="rounded-full border-thin px-6 py-3 text-sm transition hover:bg-white/10"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="collegeName" className="block text-sm text-white mb-2">
                    College Name *
                  </label>
                  <input
                    id="collegeName"
                    name="collegeName"
                    type="text"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Example University"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="firstName" className="block text-sm text-white mb-2">
                    Your First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-white mb-2">
                    Official Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@college.edu"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                    required
                  />
                  <p className="mt-2 text-xs text-soft">Use your official college email address</p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm text-white mb-2">
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                    required
                  />
                  <p className="mt-2 text-xs text-soft">At least 8 characters with a letter and a number</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-full border-strong bg-white/10 text-white font-medium transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>

                <p className="text-center text-xs text-soft mt-4">
                  * Required fields
                </p>
              </form>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3 text-center">
            <div className="rounded-2xl bg-black/40 border border-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-soft mb-2">Step 1</p>
              <p className="text-sm text-muted">Submit Request</p>
            </div>
            <div className="rounded-2xl bg-black/40 border border-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-soft mb-2">Step 2</p>
              <p className="text-sm text-muted">SUPERADMIN Reviews</p>
            </div>
            <div className="rounded-2xl bg-black/40 border border-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-soft mb-2">Step 3</p>
              <p className="text-sm text-muted">Get Admin Access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
