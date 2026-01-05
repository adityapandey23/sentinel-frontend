'use client';

import { useEffect, useState } from 'react';
import { sessionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/errors';
import type { Session } from '@/types';
import {
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  Wifi,
  X,
  Apple,
} from 'lucide-react';

// Device icon based on platform and mobile status
function DeviceIcon({ session }: { session: Session }) {
  const platform = session.platform?.toLowerCase() || '';
  const isMobile = session.isMobile;

  if (isMobile) {
    return <Smartphone className="h-6 w-6 sm:h-8 sm:w-8" />;
  }

  if (platform.includes('mac') || platform.includes('ipad')) {
    return <Laptop className="h-6 w-6 sm:h-8 sm:w-8" />;
  }

  if (platform.includes('tablet') || platform.includes('android')) {
    return <Tablet className="h-6 w-6 sm:h-8 sm:w-8" />;
  }

  return <Monitor className="h-6 w-6 sm:h-8 sm:w-8" />;
}

// Browser icon component
function BrowserIcon({ browser }: { browser: string | null }) {
  const browserName = browser?.toLowerCase() || '';

  if (browserName.includes('chrome')) {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 p-0.5">
        <div className="h-full w-full rounded-full bg-blue-500" />
      </div>
    );
  }

  if (browserName.includes('firefox')) {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400" />
      </div>
    );
  }

  if (browserName.includes('safari')) {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
        <div className="h-2 w-0.5 rotate-45 bg-white" />
      </div>
    );
  }

  if (browserName.includes('edge')) {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-400">
        <div className="h-2.5 w-2.5 rounded-full border-2 border-white" />
      </div>
    );
  }

  return <Globe className="h-5 w-5 text-zinc-500" />;
}

// OS icon component
function OsIcon({ os }: { os: string | null }) {
  const osName = os?.toLowerCase() || '';

  if (osName.includes('windows')) {
    return (
      <div className="grid h-5 w-5 grid-cols-2 gap-0.5 p-0.5">
        <div className="rounded-sm bg-blue-500" />
        <div className="rounded-sm bg-blue-500" />
        <div className="rounded-sm bg-blue-500" />
        <div className="rounded-sm bg-blue-500" />
      </div>
    );
  }

  if (osName.includes('mac') || osName.includes('ios')) {
    return <Apple className="h-5 w-5 text-zinc-300" />;
  }

  if (osName.includes('linux') || osName.includes('ubuntu')) {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-yellow-400 to-orange-400">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
    );
  }

  if (osName.includes('android')) {
    return (
      <div className="flex h-5 w-5 items-center justify-center">
        <div className="h-3.5 w-4 rounded-t-full bg-green-500" />
      </div>
    );
  }

  return <Monitor className="h-5 w-5 text-zinc-500" />;
}

export default function SessionsPage() {
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
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Active Sessions</h1>
          <p className="text-sm text-zinc-400 sm:text-base">
            Manage your active sessions across devices
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleRevokeAllOthers}
          disabled={sessions.filter((s) => !s.isCurrent).length === 0}
          className="w-full gap-2 sm:w-auto"
          size="sm"
        >
          <X className="h-4 w-4" />
          <span className="sm:hidden">Revoke Others</span>
          <span className="hidden sm:inline">Revoke All Others</span>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : sessions.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-lg text-zinc-400">No active sessions</p>
        </div>
      ) : (
        /* Sessions List */
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${
                session.isCurrent
                  ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-zinc-900/50 to-zinc-900/50'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              {/* Current session indicator line */}
              {session.isCurrent && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
              )}

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Device Icon */}
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                      session.isCurrent
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <DeviceIcon session={session} />
                  </div>

                  {/* Session Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                            {session.platform || 'Unknown Device'}
                          </h3>
                          {session.isCurrent && (
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                              This Device
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                          <span className="inline-flex items-center gap-1.5">
                            <BrowserIcon browser={session.browser} />
                            <span className="truncate">{session.browser || 'Unknown'}</span>
                          </span>
                          <span className="hidden text-zinc-700 xs:inline">•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <OsIcon os={session.os} />
                            <span className="truncate">{session.os || 'Unknown'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Revoke Button - Desktop */}
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.sessionId)}
                          disabled={revokingId === session.sessionId}
                          className="hidden shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-400 sm:inline-flex"
                        >
                          {revokingId === session.sessionId ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Revoking...
                            </>
                          ) : (
                            <>
                              <X className="mr-1.5 h-4 w-4" />
                              Revoke
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Session Metadata */}
                    <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-x-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-zinc-600" />
                        <span className="truncate">{formatLocation(session)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 shrink-0 text-zinc-600" />
                        <span className="truncate font-mono text-xs">{session.ip || 'Unknown IP'}</span>
                      </div>
                      {session.timezone && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-zinc-600" />
                          <span className="truncate">{session.timezone}</span>
                        </div>
                      )}
                    </div>

                    {/* Revoke Button - Mobile */}
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.sessionId)}
                        disabled={revokingId === session.sessionId}
                        className="mt-4 h-9 w-full text-red-400 hover:bg-red-500/10 hover:text-red-400 sm:hidden"
                      >
                        {revokingId === session.sessionId ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Revoking...
                          </>
                        ) : (
                          <>
                            <X className="mr-1.5 h-4 w-4" />
                            Revoke Session
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
