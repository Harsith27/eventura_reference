'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
  profileImage?: string | null;
}

interface OrganizedEvent {
  id: string;
  eventCode?: string;
  title: string;
  date: string;
  venue: string;
  bannerUrl?: string | null;
  isLive?: boolean;
  customRegistrationFields?: string;
  _count?: {
    registrations: number;
  };
}

const extractIframeSrc = (input: string): string => {
  const standard = input.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (standard?.[1]) {
    return standard[1].trim();
  }
  const escaped = input.match(/<iframe[^>]*src=\\"([^\\"]+)\\"[^>]*>/i);
  return escaped?.[1]?.trim() || '';
};

const stripHtml = (input: string): string => {
  return input
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getVenueLabel = (venue: string): string => {
  if (!venue) return 'Location details unavailable';
  const venueText = stripHtml(venue);
  if (venueText) return venueText;
  if (extractIframeSrc(venue) || /https?:\/\//i.test(venue)) return 'View map';
  return 'Location details unavailable';
};

export default function OrganizerMyEventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<OrganizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const meResponse = await fetch('/api/auth/me');
        if (!meResponse.ok) {
          router.push('/login');
          return;
        }

        const meData = await meResponse.json();
        const currentUser = meData.data?.user || meData.user;

        if (currentUser.role !== 'ORGANIZER') {
          router.push('/dashboard');
          return;
        }

        setUser(currentUser);

        const mineResponse = await fetch('/api/events/mine');
        if (mineResponse.ok) {
          const mineData = await mineResponse.json();
          const rawEvents = mineData.data?.events || [];
          setEvents(Array.isArray(rawEvents) ? rawEvents : []);
        }
      } catch (error) {
        console.error('Failed to load my events:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const filteredEvents = useMemo(() => {
    return [...events]
      .filter((event) => {
        const q = searchQuery.trim().toLowerCase();
        const venueLabel = getVenueLabel(event.venue).toLowerCase();
        const matchesSearch =
          q.length === 0 ||
          event.title.toLowerCase().includes(q) ||
          venueLabel.includes(q);

        if (!matchesSearch) {
          return false;
        }

        if (statusFilter === 'all') {
          return true;
        }

        const eventDate = new Date(event.date);
        const now = new Date();
        const eventEndTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);

        if (statusFilter === 'upcoming') {
          return eventDate > now;
        }

        if (statusFilter === 'ongoing') {
          return now >= eventDate && now <= eventEndTime;
        }

        return now > eventEndTime;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return (b._count?.registrations || 0) - (a._count?.registrations || 0);
      });
  }, [events, searchQuery, sortBy, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-normal mb-2">My Events</h1>
            <p className="text-muted">All events created by you</p>
          </div>
          <Link
            href="/events/create"
            className="rounded-lg bg-neon px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neon/90"
          >
            Create Event
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {(['all', 'upcoming', 'ongoing', 'past'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === status
                  ? 'border border-neon text-neon'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              {status === 'all'
                ? 'All'
                : status === 'upcoming'
                  ? 'Upcoming'
                  : status === 'ongoing'
                    ? 'Live'
                    : 'Past'}
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search your events..."
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

        {filteredEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.date);
              const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const formattedTime = eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              let visibilityText = 'Public';
              let visibilityBgColor = 'bg-green-500/80';
              try {
                const parsed = event.customRegistrationFields ? JSON.parse(event.customRegistrationFields) : null;
                const visibility = parsed?.visibility?.mode || 'Public';
                const collegeCount = parsed?.visibility?.collegeNames?.length || 0;
                if (visibility === 'College') {
                  visibilityText = 'College Only';
                  visibilityBgColor = 'bg-blue-500/80';
                } else if (visibility === 'Custom') {
                  visibilityText = `${collegeCount} College${collegeCount !== 1 ? 's' : ''}`;
                  visibilityBgColor = 'bg-purple-500/80';
                }
              } catch {
                // Keep fallback visibility values.
              }

              return (
                <Link key={event.id} href={`/events/${event.eventCode || event.id}`}>
                  <div className="group relative rounded-xl border border-white/10 overflow-hidden bg-black/30 hover:border-neon/40 transition cursor-pointer h-[160px] flex">
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

                      <div className="absolute top-2 right-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm ${visibilityBgColor} text-white`}>
                          {visibilityText}
                        </span>
                      </div>

                      {event.isLive && (
                        <div className="absolute bottom-2 left-2">
                          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm bg-red-500/90 text-white">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                            LIVE
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-1/2 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold mb-2 line-clamp-2 text-white group-hover:text-neon transition">
                          {event.title}
                        </h3>

                        <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted">
                          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formattedDate} • {formattedTime}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted">
                          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-1">{getVenueLabel(event.venue)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 text-xs pt-2 border-t border-white/10">
                        <span className="text-white/80 bg-white/10 px-2 py-1 rounded font-medium flex-shrink-0">
                          <svg className="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event._count?.registrations || 0}
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
                className="px-4 py-2 bg-neon text-black rounded-lg hover:bg-neon/80 transition text-sm font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
