'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    collegeId: '',
    collegeName: '',
    collegeChoice: '',
    organizationChoice: '',
    organizationName: '',
    contactNumber: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  const [collegesLoading, setCollegesLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleSelect = (role: 'USER' | 'ORGANIZER') => {
    setError('');
    setFormData((prev) => {
      if (role === 'ORGANIZER') {
        return {
          ...prev,
          role,
          collegeId: '',
          collegeChoice: '',
          collegeName: '',
        };
      }

      return {
        ...prev,
        role,
        organizationChoice: '',
        organizationName: '',
        contactNumber: '',
        reason: '',
      };
    });
  };

  useEffect(() => {
    const loadColleges = async () => {
      setCollegesLoading(true);
      try {
        const response = await fetch('/api/colleges');
        if (response.ok) {
          const data = await response.json();
          setColleges(data.data || []);
        }
      } catch (fetchError) {
        console.error('Failed to fetch colleges:', fetchError);
      } finally {
        setCollegesLoading(false);
      }
    };

    loadColleges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.role === 'USER' && !formData.collegeId && !formData.collegeName.trim()) {
      setError('Please select your college');
      return;
    }

    if (formData.role === 'ORGANIZER') {
      if (!formData.organizationChoice) {
        setError('Please select your college or choose Other');
        return;
      }

      if (formData.organizationChoice === 'OTHER' && !formData.organizationName.trim()) {
        setError('College name is required');
        return;
      }

      if (!formData.contactNumber.trim()) {
        setError('Contact number is required');
        return;
      }

      if (!formData.reason.trim()) {
        setError('Please share why you need organizer access');
        return;
      }
    }

    setLoading(true);

    try {
      const { confirmPassword, organizationChoice, collegeChoice, ...registerData } = formData;

      // Create payload based on role
      const payload: any = {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
      };

      // Add college fields only for USER role
      if (formData.role === 'USER') {
        if (registerData.collegeId) {
          payload.collegeId = registerData.collegeId;
        }
        if (registerData.collegeName) {
          payload.collegeName = registerData.collegeName;
        }
      }

      // Add organization fields only for ORGANIZER role
      if (formData.role === 'ORGANIZER') {
        payload.organizationName = registerData.organizationName;
        payload.contactNumber = registerData.contactNumber;
        payload.reason = registerData.reason;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (formData.role === 'ORGANIZER') {
          router.push('/waiting-for-approval');
        } else {
          router.push('/login?registered=true');
        }
      } else {
        const data = await response.json();
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          setError(data.errors[0]?.message || data.message || 'Registration failed');
        } else {
          setError(data.message || data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-4 z-40 relative">
        <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-[120vw] -translate-x-1/2 bg-transparent blur-xl" />
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-black/70 px-7 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18),inset_1px_0_0_rgba(255,255,255,0.12),inset_-1px_0_0_rgba(255,255,255,0.12)] backdrop-blur">
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
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex">
              <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('USER')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    formData.role === 'USER'
                      ? 'bg-white/15 text-white shadow-[0_6px_18px_rgba(255,255,255,0.08)]'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ORGANIZER')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    formData.role === 'ORGANIZER'
                      ? 'bg-white/15 text-white shadow-[0_6px_18px_rgba(255,255,255,0.08)]'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  Organiser
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border-thin px-4 py-2 text-sm text-muted transition hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9)]"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Register Card */}
          <div className="rounded-3xl border border-white/10 p-7 bg-black">
            <div className="text-center mb-6">
              <h1 className="mt-3 text-3xl font-normal bg-gradient-to-r from-pink-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                Create your account
              </h1>
              <p className="mt-3 text-sm text-muted">
                Start discovering and registering for events
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center md:hidden">
                <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('USER')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      formData.role === 'USER'
                        ? 'bg-white/15 text-white shadow-[0_6px_18px_rgba(255,255,255,0.08)]'
                        : 'text-muted hover:text-white'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('ORGANIZER')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      formData.role === 'ORGANIZER'
                        ? 'bg-white/15 text-white shadow-[0_6px_18px_rgba(255,255,255,0.08)]'
                        : 'text-muted hover:text-white'
                    }`}
                  >
                    Organiser
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm text-white mb-2">
                    First name
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
                  <label htmlFor="lastName" className="block text-sm text-white mb-2">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-white mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your-email@college.edu"
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-white mb-2">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                  required
                />
              </div>

              {formData.role === 'USER' && (
                <>
                  <div>
                    <label htmlFor="collegeId" className="block text-sm text-white mb-2">
                      College
                    </label>
                    <Select
                      value={formData.collegeChoice || formData.collegeId}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          collegeChoice: value,
                          collegeId: value === 'OTHER' ? '' : value,
                          collegeName: value === 'OTHER' ? '' : prev.collegeName,
                        }));
                      }}
                      disabled={collegesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={collegesLoading ? 'Loading colleges...' : 'Select your college'} />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.collegeChoice === 'OTHER' && (
                    <div>
                      <label htmlFor="collegeName" className="block text-sm text-white mb-2">
                        College name
                      </label>
                      <input
                        id="collegeName"
                        name="collegeName"
                        type="text"
                        value={formData.collegeName}
                        onChange={handleChange}
                        placeholder="Your college name"
                        className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                        required
                      />
                    </div>
                  )}
                </>
              )}

              {formData.role === 'ORGANIZER' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="organizationChoice" className="block text-sm text-white mb-2">
                      College
                    </label>
                    <Select
                      value={formData.organizationChoice}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          organizationChoice: value,
                          organizationName: value,
                        }));
                      }}
                      disabled={collegesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={collegesLoading ? 'Loading colleges...' : 'Select your college'} />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.name}>
                            {college.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="contactNumber" className="block text-sm text-white mb-2">
                      Contact number
                    </label>
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="text"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm text-white mb-2">
                      Why do you need organizer access?
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Share the events you plan to host"
                      className="w-full min-h-[110px] px-4 py-3 rounded-2xl bg-black/40 border-thin text-white placeholder:text-soft focus:outline-none focus:border-neon transition"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full border-strong bg-white/10 text-white font-medium transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-neon hover:underline">
                Sign in
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center text-xs text-soft">
            Admin-approved publishing · QR attendance · Secure access
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
