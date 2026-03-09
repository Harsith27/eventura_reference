'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
}

interface Event {
  id: string;
  eventCode?: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  capacity: number;
  bannerUrl?: string;
  isLive?: boolean;
  organiser: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    registrations: number;
  };
  customRegistrationFields?: string;
  collegeId?: string;
}

export default function BrowseEventsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'college'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, []);

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
      // User not authenticated, that's fine for browse page
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?page=1&limit=100');
      if (response.ok) {
        const data = await response.json();
        const eventsList = data.data?.events || data.events || [];
        setEvents(eventsList);
        setFilteredEvents(eventsList);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let results = events.filter((event) => {
      // Text search filter
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const eventDate = new Date(event.date);
        const now = new Date();
        const eventEndTime = new Date(eventDate.getTime() + (3 * 60 * 60 * 1000)); // Assume 3-hour events
        
        if (statusFilter === 'upcoming') {
          matchesStatus = eventDate > now;
        } else if (statusFilter === 'ongoing') {
          matchesStatus = now >= eventDate && now <= eventEndTime;
        } else if (statusFilter === 'past') {
          matchesStatus = now > eventEndTime;
        }
      }

      // Visibility filter
      let matchesVisibility = true;
      if (visibilityFilter !== 'all') {
        try {
          const customFields = event.customRegistrationFields 
            ? JSON.parse(event.customRegistrationFields) 
            : null;
          const visibility = customFields?.visibility?.mode || 'Public';
          
          if (visibilityFilter === 'public') {
            matchesVisibility = visibility === 'Public';
          } else if (visibilityFilter === 'college') {
            matchesVisibility = visibility === 'College' || visibility === 'Custom';
          }
        } catch {
          // If metadata is malformed, keep event visible instead of failing the filter.
          matchesVisibility = true;
        }
      }

      return matchesSearch && matchesStatus && matchesVisibility;
    });

    if (sortBy === 'date') {
      results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      results.sort((a, b) => b._count.registrations - a._count.registrations);
    }

    setFilteredEvents(results);
  }, [searchQuery, sortBy, statusFilter, visibilityFilter, events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-white">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      {/* Header */}
      {authLoading ? (
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
              <div className="h-9 w-32 rounded-full bg-white/5" aria-hidden="true" />
            </div>
          </div>
        </header>
      ) : user ? (
        <Navbar user={user} />
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
      )}

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        {/* Filter Tabs and Search Row */}
        <div className="mb-8">
          {/* Status Filter Tabs */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-neon text-black'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                statusFilter === 'upcoming'
                  ? 'bg-neon text-black'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                statusFilter === 'ongoing'
                  ? 'bg-neon text-black'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon animate-pulse"></span>
                Live
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('past')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                statusFilter === 'past'
                  ? 'bg-neon text-black'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              Past
            </button>
          </div>
          
          {/* Visibility Filter Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                visibilityFilter === 'all'
                  ? 'border border-neon text-neon'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVisibilityFilter('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                visibilityFilter === 'public'
                  ? 'border border-neon text-neon'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Public
              </span>
            </button>
            <button
              onClick={() => setVisibilityFilter('college')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                visibilityFilter === 'college'
                  ? 'border border-neon text-neon'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                College
              </span>
            </button>
          </div>

          {/* Search and Sort Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30 transition"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity')}
              className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30 transition cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.date);
              const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              const organizerName = `${event.organiser.firstName} ${event.organiser.lastName}`.trim();

              // Get visibility info
              let visibilityText = 'Public';
              let visibilityBgColor = 'bg-green-500/80';
              try {
                const customFields = event.customRegistrationFields 
                  ? JSON.parse(event.customRegistrationFields) 
                  : null;
                const visibility = customFields?.visibility?.mode || 'Public';
                const collegeCount = customFields?.visibility?.collegeNames?.length || 0;
                
                if (visibility === 'College') {
                  visibilityText = 'College Only';
                  visibilityBgColor = 'bg-blue-500/80';
                } else if (visibility === 'Custom') {
                  visibilityText = `${collegeCount} College${collegeCount !== 1 ? 's' : ''}`;
                  visibilityBgColor = 'bg-purple-500/80';
                } else {
                  visibilityText = 'Public';
                  visibilityBgColor = 'bg-green-500/80';
                }
              } catch {}

              // Check event status
              const now = new Date();
              const eventEndTime = new Date(eventDate.getTime() + (3 * 60 * 60 * 1000));
              const isLive = event.isLive || false; // Use database isLive field

              return (
                <Link key={event.id} href={`/events/${event.eventCode}`}>
                  <div className="group relative rounded-xl border border-white/10 overflow-hidden bg-black/30 hover:border-neon/40 transition cursor-pointer h-[160px] flex">
                    {/* Left: Poster (50% width) */}
                    <div className="relative w-1/2 overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                      {event.bannerUrl ? (
                        <img
                          src={event.bannerUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Visibility Badge on Top Right of Poster */}
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm ${visibilityBgColor} text-white`}>
                          {visibilityText}
                        </span>
                      </div>
                      {isLive && (
                        <div className="absolute bottom-2 left-2">
                          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm bg-red-500/90 text-white">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                            LIVE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Content (50% width) */}
                    <div className="w-1/2 p-4 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="text-sm font-semibold mb-2 line-clamp-2 text-white group-hover:text-neon transition">
                          {event.title}
                        </h3>

                        {/* Date & Time */}
                        <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted">
                          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formattedDate} • {formattedTime}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted">
                          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-1">
                            {event.venue.includes('<iframe') || event.venue.includes('iframe') 
                              ? 'View map' 
                              : event.venue}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Organizer & Registration Count */}
                      <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-white/10">
                        <span className="text-muted truncate">By {organizerName}</span>
                        <span className="text-white/80 bg-white/10 px-2 py-1 rounded font-medium flex-shrink-0">
                          <svg className="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event._count.registrations}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/30 p-12 text-center">
            <p className="text-muted mb-4">
              {searchQuery ? 'No events found matching your search' : 'No events available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-neon text-black rounded-lg hover:bg-neon/80 transition text-sm font-medium">
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
