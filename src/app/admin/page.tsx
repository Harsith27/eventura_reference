'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalFeedback: number;
}

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
  status: string;
  _count: {
    registrations: number;
  };
}

interface OrganizerRequest {
  id: string;
  organizationName: string;
  website?: string | null;
  contactNumber: string;
  reason: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
}

interface College {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<OrganizerRequest[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'organizers'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'organizers') {
      fetchColleges();
    }
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok || userResponse.status === 401) {
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      const currentUser = userData.data?.user || userData.user;

      if (!currentUser || currentUser.role !== 'ADMIN') {
        router.push('/user/dashboard');
        return;
      }

      setUser(currentUser);

      // Fetch admin stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch all users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || usersData.users || []);
      }

      // Fetch all events
      const eventsResponse = await fetch('/api/admin/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      await fetchOrganizerRequests();
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerRequests = async () => {
    try {
      const response = await fetch('/api/admin/organisers');
      if (response.ok) {
        const data = await response.json();
        setOrganizerRequests(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch organizer requests:', error);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch('/api/colleges');
      if (response.ok) {
        const data = await response.json();
        setColleges(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
    }
  };

  const openCollegeModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setSelectedCollegeId('');
    setShowCollegeModal(true);
  };

  const closeCollegeModal = () => {
    setShowCollegeModal(false);
    setSelectedRequestId(null);
    setSelectedCollegeId('');
  };

  const handleOrganizerAction = async (requestId: string, action: 'APPROVE' | 'REJECT', collegeId?: string) => {
    setRequestsLoading(true);
    try {
      const response = await fetch('/api/admin/organisers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, collegeId }),
      });
      if (response.ok) {
        await fetchOrganizerRequests();
        closeCollegeModal();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Failed to process organizer request:', error);
      alert('Failed to process request');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproveWithCollege = () => {
    if (!selectedCollegeId) {
      alert('Please select a college');
      return;
    }
    if (selectedRequestId) {
      handleOrganizerAction(selectedRequestId, 'APPROVE', selectedCollegeId);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
    <div className="min-h-screen bg-ink text-white">
      {/* Header */}
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-normal mb-2">Admin Dashboard</h1>
          <p className="text-muted">Manage users, events, and platform statistics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'overview'
                ? 'border-b-2 border-neon text-neon'
                : 'text-muted hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'users'
                ? 'border-b-2 border-neon text-neon'
                : 'text-muted hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'events'
                ? 'border-b-2 border-neon text-neon'
                : 'text-muted hover:text-white'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('organizers')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'organizers'
                ? 'border-b-2 border-neon text-neon'
                : 'text-muted hover:text-white'
            }`}
          >
            Organizer Requests
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/40 p-6">
              <p className="text-sm text-muted uppercase tracking-wider mb-2">Total Users</p>
              <p className="text-3xl font-semibold">{stats.totalUsers}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-6">
              <p className="text-sm text-muted uppercase tracking-wider mb-2">Total Events</p>
              <p className="text-3xl font-semibold">{stats.totalEvents}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-6">
              <p className="text-sm text-muted uppercase tracking-wider mb-2">Total Registrations</p>
              <p className="text-3xl font-semibold">{stats.totalRegistrations}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-6">
              <p className="text-sm text-muted uppercase tracking-wider mb-2">Total Feedback</p>
              <p className="text-3xl font-semibold">{stats.totalFeedback}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/40">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-6 py-3">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-3 text-muted">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-neon/10 text-neon">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted text-sm">Recently added</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/40">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Event Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Registrations</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-6 py-3">{e.title}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          e.status === 'PUBLISHED'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{e._count.registrations}</td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/events/${e.eventCode}`}
                        className="text-neon hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'organizers' && (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/40">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Organizer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">College</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizerRequests.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-muted" colSpan={5}>
                      No pending organizer requests.
                    </td>
                  </tr>
                ) : (
                  organizerRequests.map((request) => (
                    <tr key={request.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-3">
                        <div className="font-medium">{request.user.firstName} {request.user.lastName}</div>
                        <div className="text-xs text-muted">{request.user.email}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium">{request.organizationName}</div>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted">
                        {request.contactNumber}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted">
                        {request.reason}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openCollegeModal(request.id)}
                            disabled={requestsLoading}
                            className="rounded-full border border-green-500/40 px-3 py-1 text-xs text-green-400 transition hover:bg-green-500/10 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOrganizerAction(request.id, 'REJECT')}
                            disabled={requestsLoading}
                            className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* College Selection Modal */}
      {showCollegeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-lg border border-white/10 bg-ink p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-semibold">Select College</h2>
            <p className="mb-4 text-sm text-muted">
              Choose which college this organizer belongs to
            </p>
            
            <div className="mb-6">
              <label htmlFor="college-select" className="mb-2 block text-sm font-medium">
                College
              </label>
              <select
                id="college-select"
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              >
                <option value="">Select a college...</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeCollegeModal}
                disabled={requestsLoading}
                className="rounded-md border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveWithCollege}
                disabled={requestsLoading || !selectedCollegeId}
                className="rounded-md bg-neon px-4 py-2 text-sm font-medium text-black transition hover:bg-neon/90 disabled:opacity-50"
              >
                {requestsLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
