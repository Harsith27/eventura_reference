'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Camera, Keyboard } from 'lucide-react';

interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
  profileImage?: string | null;
}

interface AttendanceResult {
  success: boolean;
  message: string;
  registration?: {
    studentName: string;
    email: string;
    eventTitle: string;
    registeredAt: string;
    markedAt?: string | null;
  };
}

export default function ScanAttendancePage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [manualEntry, setManualEntry] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Check authorization on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const user = data?.data?.user || data?.user;
          setCurrentUser(user);
          
          if (user?.role === 'ORGANIZER' || user?.role === 'SUPERADMIN' || user?.role === 'SUPER_ADMIN') {
            setIsAuthorized(true);
          } else {
            router.push('/');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const parseQrToken = (rawInput: string) => {
    let token = rawInput.trim();
    if (!token) return '';

    try {
      const parsed = JSON.parse(token);
      if (parsed?.qrToken && typeof parsed.qrToken === 'string') {
        token = parsed.qrToken;
      }
    } catch {
      // raw token path
    }

    return token;
  };

  const markAttendance = async (rawInput: string) => {
    const qrToken = parseQrToken(rawInput);
    if (!qrToken) {
      setError('Please provide a valid QR token or QR payload.');
      setResult(null);
      return;
    }

    const response = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrToken }),
    });

    const data = await response.json();
    if (response.ok) {
      setResult(data);
      setError(null);
      return;
    }

    setError(data.error || 'Failed to mark attendance');
    setResult(null);
  };

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          // Stop scanner
          scanner.clear();
          setScanning(false);

          try {
            await markAttendance(decodedText);
          } catch {
            setError('Network error. Please try again.');
            setResult(null);
          }
        },
        (errorMessage) => {
          // Scanning error (not critical, happens during scanning)
          console.log('Scan error:', errorMessage);
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  const startScanning = () => {
    setScanning(true);
    setResult(null);
    setError(null);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = async () => {
    setSubmittingManual(true);
    try {
      await markAttendance(manualEntry);
    } catch {
      setError('Network error. Please try again.');
      setResult(null);
    } finally {
      setSubmittingManual(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 max-w-md">
          <p className="text-red-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      {currentUser && <Navbar user={currentUser} />}

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-normal mb-2">Attendance</h1>
          <p className="text-muted">Scan QR or manually mark participant attendance</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border border-white/10 bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Camera className="h-5 w-5 text-neon" />
                Scan QR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!scanning && (
                <Button
                  onClick={startScanning}
                  className="w-full rounded-lg bg-neon px-4 py-2 font-semibold text-black hover:bg-neon/85"
                >
                  Start Scanner
                </Button>
              )}

              {scanning && (
                <div className="space-y-3">
                  <div id="qr-reader" className="overflow-hidden rounded-lg border border-white/10 bg-black/40" />
                  <Button
                    onClick={stopScanning}
                    className="w-full rounded-lg border border-red-500/40 bg-transparent text-red-300 hover:bg-red-500/10"
                  >
                    Stop Scanner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/10 bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Keyboard className="h-5 w-5 text-neon" />
                Manual Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted">
                Paste the QR token or full QR JSON payload and mark attendance manually.
              </p>
              <textarea
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                rows={5}
                placeholder='Example: {"qrToken":"abc123..."} or raw token'
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
              />
              <Button
                onClick={handleManualSubmit}
                disabled={submittingManual || !manualEntry.trim()}
                className="w-full rounded-lg bg-neon px-4 py-2 font-semibold text-black hover:bg-neon/85 disabled:opacity-50"
              >
                {submittingManual ? 'Marking...' : 'Mark Attendance'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {(result || error) && (
          <div className="mt-6 space-y-4">
            {result && (
              <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4">
                <div className="mb-3 flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>{result.message}</p>
                </div>

                {result.registration && (
                  <div className="grid gap-3 text-sm text-white sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted">Name</p>
                      <p>{result.registration.studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Email</p>
                      <p>{result.registration.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Event</p>
                      <p>{result.registration.eventTitle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Registered</p>
                      <p>{new Date(result.registration.registeredAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 text-red-300">
                  <XCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
