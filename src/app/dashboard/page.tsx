'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  status: string;
  profileImage?: string | null;
}

interface RegisteredItem {
  id: string;
  status: string;
  event: {
    id: string;
    eventCode?: string;
    title: string;
    date: string;
    venue: string;
    bannerUrl?: string;
    capacity?: number;
  };
}

interface BookmarkItem {
  id: string;
  event: {
    id: string;
    eventCode?: string;
    title: string;
    description?: string;
    date: string;
    venue: string;
    bannerUrl?: string;
    capacity?: number;
    _count?: {
      registrations?: number;
    };
  };
}

interface EventCard {
  id: string;
  eventCode?: string;
  title: string;
  description?: string;
  date: string;
  venue: string;
  bannerUrl?: string;
  registrationsCount: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredItem[]>([]);
  const [savedEvents, setSavedEvents] = useState<BookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<'registered' | 'saved'>('registered');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
  const [loading, setLoading] = useState(true);

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
        setUser(currentUser);

        const [registrationsResponse, bookmarksResponse] = await Promise.all([
          fetch('/api/registrations'),
          fetch('/api/bookmarks'),
        ]);

        if (registrationsResponse.ok) {
          const registrationsData = await registrationsResponse.json();
          const rawRegistrations = registrationsData.data?.registrations || registrationsData.registrations || [];
          setRegisteredEvents(Array.isArray(rawRegistrations) ? rawRegistrations : []);
        }

        if (bookmarksResponse.ok) {
          const bookmarksData = await bookmarksResponse.json();
          const rawBookmarks =
            bookmarksData.data?.bookmarks?.data ||
            bookmarksData.data?.bookmarks ||
            bookmarksData.bookmarks ||
            [];
          setSavedEvents(Array.isArray(rawBookmarks) ? rawBookmarks : []);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

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

  const getBaseEvents = (): EventCard[] => {
    if (activeTab === 'registered') {
      return registeredEvents.map((item) => ({
        id: item.event.id,
        eventCode: item.event.eventCode,
        title: item.event.title,
        date: item.event.date,
        venue: item.event.venue,
        bannerUrl: item.event.bannerUrl,
        registrationsCount: 0,
      }));
    }

    return savedEvents.map((item) => ({
      id: item.event.id,
      eventCode: item.event.eventCode,
      title: item.event.title,
      description: item.event.description,
      date: item.event.date,
      venue: item.event.venue,
      bannerUrl: item.event.bannerUrl,
      registrationsCount: item.event._count?.registrations || 0,
    }));
  };

  const filteredEvents = getBaseEvents()
    .filter((event) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        event.title.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        (event.description || '').toLowerCase().includes(query);

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
      return b.registrationsCount - a.registrationsCount;
    });

  const emptyStateTitle = activeTab === 'registered' ? 'No registered events yet.' : 'No saved events yet.';
  const emptyStateCta = activeTab === 'registered' ? 'Register from Explore Events' : 'Save events from Explore Events';

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-normal mb-2">Dashboard</h1>
          <p className="text-muted">Manage your registered and saved events</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-black/50 p-6">
          <div className="mb-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'registered'
                  ? 'bg-neon text-black'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              My Registered Events ({registeredEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'saved'
                  ? 'bg-neon text-black'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              My Saved Events ({savedEvents.length})
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-3">
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

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'registered' ? 'registered' : 'saved'} events...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/40 transition focus:border-white/30 focus:outline-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity')}
              className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white transition focus:border-white/30 focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-10 text-center">
              <p className="text-sm text-muted mb-4">{emptyStateTitle}</p>
              <Link
                href="/browse"
                className="inline-block rounded-lg bg-neon px-5 py-2 text-sm font-medium text-black transition hover:bg-neon/90"
              >
                {emptyStateCta}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString();
                const formattedTime = eventDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.eventCode || event.id}`}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-black/30 transition hover:border-white/30"
                  >
                    <div className="relative h-36 w-full bg-black/60">
                      {event.bannerUrl ? (
                        <Image
                          src={event.bannerUrl}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-white transition group-hover:text-neon line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted line-clamp-2 min-h-[2.5rem]">
                        {event.description || `Happening at ${event.venue}`}
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-muted">
                        <p>{formattedDate} • {formattedTime}</p>
                        <p>{event.venue}</p>
                        {activeTab === 'saved' && event.registrationsCount > 0 && (
                          <p>{event.registrationsCount} registered</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
