'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { sessionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/lib/error';
import type { Session } from '@/lib/types';

export default function SessionsPage() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await sessionsApi.getSessions();
      setSessions(data.sessions);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    setRevokingId(sessionId);
    try {
      await sessionsApi.revokeSession(sessionId);
      await loadSessions();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!confirm('Are you sure you want to revoke all other sessions?')) {
      return;
    }

    try {
      const response = await sessionsApi.revokeAllOthers();
      await loadSessions();
      alert(`Revoked ${response.deletedCount || 0} session(s)`);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const formatLocation = (session: Session) => {
    const parts = [session.cityCode, session.region, session.countryCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Sentinel</h1>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Active Sessions</h2>
                <p className="text-muted-foreground">Manage your active sessions across devices</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleRevokeAllOthers}
                disabled={sessions.filter((s) => !s.isCurrent).length === 0}
              >
                Revoke All Others
              </Button>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No active sessions</div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="rounded-lg border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          {session.isCurrent && (
                            <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                              Current Session
                            </span>
                          )}
                          <div className="text-lg font-semibold">
                            {session.platform || 'Unknown Device'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-2">
                          <div>
                            <span className="font-medium">Browser:</span>{' '}
                            {session.browser || 'Unknown'}
                          </div>
                          <div>
                            <span className="font-medium">OS:</span> {session.os || 'Unknown'}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {formatLocation(session)}
                          </div>
                          <div>
                            <span className="font-medium">IP:</span> {session.ip || 'Unknown'}
                          </div>
                          {session.timezone && (
                            <div>
                              <span className="font-medium">Timezone:</span> {session.timezone}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Device:</span>{' '}
                            {session.isMobile ? 'Mobile' : 'Desktop'}
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeSession(session.sessionId)}
                          disabled={revokingId === session.sessionId}
                        >
                          {revokingId === session.sessionId ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Revoking...
                            </>
                          ) : (
                            'Revoke'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
