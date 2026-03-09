'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
  isProfileComplete?: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'about' | 'flow' | 'impact' | 'contact'>('about');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (loading || user) return;

    const sections = ['about', 'flow', 'impact', 'contact'] as const;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id as 'about' | 'flow' | 'impact' | 'contact');
        }
      },
      {
        threshold: [0.3, 0.5, 0.7],
        rootMargin: '-20% 0px -55% 0px',
      }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [loading, user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const currentUser = data.data?.user || data.user;
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (error) {
      // User not authenticated, that's fine for home page
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Show authenticated navbar or public navbar */}
      {!loading && (
        user ? (
          <>
            <Navbar user={user} />
            {!user.isProfileComplete && 
             (user.role !== 'ORGANIZER' || user.status === 'ACTIVE') && (
              <div className="mx-auto w-full max-w-7xl px-6 mt-6">
                <div className="rounded-xl bg-gradient-to-r from-neon/10 via-neon/5 to-transparent border border-neon/30 p-5 flex items-center gap-4 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neon/20 border border-neon/50">
                    <svg className="w-6 h-6 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-1">Complete Your Profile</p>
                    <p className="text-sm text-muted">Add your details to unlock all features and get started</p>
                  </div>
                  <Link
                    href="/complete-profile"
                    className="px-5 py-2.5 rounded-lg bg-neon text-black font-semibold hover:bg-neon/90 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] text-sm whitespace-nowrap"
                  >
                    Complete Now
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
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
                <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-sm md:flex">
                  <a
                    className={`rounded-full px-3 py-1.5 transition-all duration-300 ${
                      activeSection === 'about' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'
                    }`}
                    href="#about"
                  >
                    About
                  </a>
                  <a
                    className={`rounded-full px-3 py-1.5 transition-all duration-300 ${
                      activeSection === 'impact' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'
                    }`}
                    href="#impact"
                  >
                    Impact
                  </a>
                  <a
                    className={`rounded-full px-3 py-1.5 transition-all duration-300 ${
                      activeSection === 'flow' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'
                    }`}
                    href="#flow"
                  >
                    Flow
                  </a>
                  <a
                    className={`rounded-full px-3 py-1.5 transition-all duration-300 ${
                      activeSection === 'contact' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'
                    }`}
                    href="#contact"
                  >
                    Contact
                  </a>
                </nav>
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="rounded-full border-thin px-4 py-2 text-sm text-muted transition hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg border-strong bg-white/10 px-4 py-2 text-sm text-white transition hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9)]"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )
      )}

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,90,95,0.2),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0.5px,transparent_0.5px),linear-gradient(0deg,rgba(255,255,255,0.05)_0.5px,transparent_0.5px)] bg-[length:42px_42px] opacity-40" />
          </div>
          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-3 rounded-full border-thin px-4 py-2 text-xs uppercase tracking-[0.3em] text-soft">
                <span className="text-neon">Live</span>
                Events in real time
              </div>
              <h1 className="mt-6 text-4xl font-normal leading-tight sm:text-5xl">
                College Event Management.<br />
                <span className="bg-gradient-to-r from-pink-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                  Simplified.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted">
                Eventura connects SUPERADMIN, college admins, organizers, and students in one unified platform. 
                From admin-approved event publishing to QR-based attendance—everything is automated.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/browse"
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 p-[2px] transition transform hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_30px_rgba(236,72,153,0.5)]"
                >
                  <span className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm text-white transition">
                    Browse Events
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/contact-admin"
                  className="rounded-full border-thin px-5 py-2 text-sm text-muted transition hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9)]"
                >
                  Request Admin Access
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-xs text-soft">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Role-based Access
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  QR Attendance
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Secure Access
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="glass card-glow rounded-3xl border-strong p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-soft">
                      Create event
                    </p>
                    <h2 className="mt-2 text-2xl font-normal">Night Market Meetup</h2>
                  </div>
                  <span className="rounded-full border-thin px-3 py-1 text-xs text-soft">
                    Public
                  </span>
                </div>
                <div className="mt-5 grid gap-3 rounded-2xl bg-black/40 p-4 text-xs text-muted">
                  <div className="flex items-center justify-between">
                    <span>Thu, Feb 19</span>
                    <span>Visakhapatnam</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1">Live music</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">Food</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">Community</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-black/40 p-4">
                    <p className="text-xs text-soft">Capacity</p>
                    <p className="mt-2 text-lg">250</p>
                  </div>
                  <div className="rounded-2xl bg-black/40 p-4">
                    <p className="text-xs text-soft">Visibility</p>
                    <p className="mt-2 text-lg">Global</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-full bg-black/40 px-4 py-3 text-xs text-soft">
                  Drop your poster, we take it from there.
                  <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-neon">
                    ↑
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="impact" className="bg-ink">
          <div className="mx-auto w-full max-w-7xl px-6 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Smart filters for campus + global.",
                  label: "Discover",
                  body: "Jump between college-only and global listings without losing focus.",
                },
                {
                  title: "Timelines that stay crisp.",
                  label: "Plan",
                  body: "Sync your schedule and receive reminders when it matters.",
                },
                {
                  title: "Verify attendance in seconds.",
                  label: "Attend",
                  body: "QR-based check-ins keep things fast and frictionless.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border-thin bg-black/40 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-soft">
                    {item.label}
                  </p>
                  <h3 className="mt-3 text-lg font-normal">{item.title}</h3>
                  <p className="mt-3 text-sm text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="story" className="bg-ink">
          <div className="mx-auto w-full max-w-7xl px-6 py-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-soft">The Story</p>
                <h2 className="mt-4 text-3xl font-normal">
                  One campus, too many tools.
                  <span className="bg-gradient-to-r from-pink-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                    {' '}
                    We stitched them together.
                  </span>
                </h2>
                <p className="mt-4 text-sm text-muted">
                  Every college runs events, but the workflow is fractured. Students search everywhere, organizers
                  chase approvals, admins juggle spreadsheets, and attendance is manual. Eventura tells a simpler story:
                  one system that coordinates every role, every approval, every QR check-in, and every notification
                  in real time.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Unified approvals", body: "Admins see requests, reviews, and publishing status in one place." },
                    { title: "Trustworthy attendance", body: "QR verification makes attendance auditable and fast." },
                    { title: "Fewer missed events", body: "Automatic reminders keep students in the loop." },
                    { title: "Measurable impact", body: "Track participation and improve the next event." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border-thin bg-black/40 p-5">
                      <h3 className="text-sm font-medium text-white">{item.title}</h3>
                      <p className="mt-2 text-xs text-muted">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border-strong bg-black/40 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-soft">Timeline</p>
                <div className="mt-6 flex gap-8">
                  <div className="flex flex-col items-center">
                    {[
                      { label: "Request", body: "College asks for admin access." },
                      { label: "Approve", body: "SUPERADMIN verifies and activates." },
                      { label: "Create", body: "Organisers publish events with clarity." },
                      { label: "Attend", body: "Students check in with QR, instantly." },
                      { label: "Improve", body: "Post-event insights guide the next launch." },
                    ].map((step, index, arr) => (
                      <div key={step.label} className="flex flex-col items-center gap-1.1">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                        {index < arr.length - 1 && (
                          <div className="w-0.5 h-16 bg-white/30" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-7 pt-0.5">
                    {[
                      { label: "Request", body: "College asks for admin access." },
                      { label: "Approve", body: "SUPERADMIN verifies and activates." },
                      { label: "Create", body: "Organisers publish events with clarity." },
                      { label: "Attend", body: "Students check in with QR, instantly." },
                      { label: "Improve", body: "Post-event insights guide the next launch." },
                    ].map((step) => (
                      <div key={step.label}>
                        <p className="text-sm text-white font-medium">{step.label}</p>
                        <p className="text-xs text-muted mt-1">{step.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="flow" className="bg-ink">
          <div className="mx-auto w-full max-w-7xl px-6 py-16">
            <div className="flex flex-col gap-8">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-soft">The Flow</p>
                <h2 className="mt-4 text-3xl font-normal">From request to attendance, everything is connected.</h2>
                <p className="mt-4 text-sm text-muted">
                  Eventura connects every handoff so no step gets lost. Admins approve, organisers publish, students register,
                  and attendance verifies — all within one continuous flow.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-4">
                {[
                  { title: "Admin access", body: "College submits details and gets approved quickly." },
                  { title: "Event publish", body: "Organisers create events with templates and assets." },
                  { title: "Student signup", body: "Users register and receive QR tickets instantly." },
                  { title: "Live tracking", body: "Check-ins and stats update in real time." },
                ].map((item) => (
                  <div key={item.title} className="rounded-3xl border-thin bg-black/40 p-6">
                    <h3 className="text-base font-medium text-white">{item.title}</h3>
                    <p className="mt-3 text-xs text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-ink">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-soft">
                How it Works
              </p>
              <h2 className="mt-4 text-3xl font-normal">
                Four Roles. One System.
              </h2>
              <p className="mt-4 text-sm text-muted">
                Eventura implements strict role-based access control with SUPERADMIN, ADMIN, ORGANISER, and USER roles. 
                Each role has specific permissions ensuring secure event management from creation to attendance tracking.
              </p>
              <div className="mt-6 grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-neon">•</span>
                  <div>
                    <span className="text-white font-medium">SUPERADMIN:</span>
                    <span className="text-muted ml-1">System control, create college admins</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon">•</span>
                  <div>
                    <span className="text-white font-medium">ADMIN:</span>
                    <span className="text-muted ml-1">Approve events, manage organizers</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon">•</span>
                  <div>
                    <span className="text-white font-medium">ORGANISER:</span>
                    <span className="text-muted ml-1">Create events, verify attendance</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon">•</span>
                  <div>
                    <span className="text-white font-medium">USER:</span>
                    <span className="text-muted ml-1">Register, receive QR codes, attend</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border-strong bg-black/40 p-6">
              <h3 className="text-lg font-normal">Key Features</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "JWT Auth", value: "Secure token-based" },
                  { label: "QR Codes", value: "UUID-based tokens" },
                  { label: "Email Alerts", value: "Automated updates" },
                  { label: "Approvals", value: "Multi-level workflow" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-black/50 p-4">
                    <p className="text-xs text-soft">{item.label}</p>
                    <p className="mt-2 text-sm text-muted">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-ink">
          <div className="mx-auto w-full max-w-7xl px-6 py-16">
            <div className="rounded-3xl border-strong bg-black/40 p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-normal">Need admin access for your college?</h3>
                  <p className="mt-3 text-sm text-muted">
                    Submit a request to become a college admin. Our SUPERADMIN team will review and approve.
                  </p>
                </div>
                <Link
                  href="/contact-admin"
                  className="rounded-full border-strong bg-white/10 px-6 py-3 text-sm text-white transition hover:bg-white/20"
                >
                  Request Admin Access
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/90 border-t border-white/10">
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center" aria-label="Home">
              <Image
                src="/branding/logo_dark_no_bg..svg"
                alt="Eventura"
                width={128}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4 text-xs text-soft">
              <span>© 2026 Eventura</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-soft">
              <a className="hover:text-white transition" href="https://x.com" target="_blank" rel="noreferrer">X</a>
              <a className="hover:text-white transition" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a className="hover:text-white transition" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="hover:text-white transition" href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
