'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { factsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/lib/error';
import type { FactResponse } from '@/lib/types';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [fact, setFact] = useState<FactResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFact();
  }, []);

  const loadFact = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await factsApi.getFact();
      setFact(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Sentinel</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Link href="/sessions">
                <Button variant="outline" size="sm">
                  Sessions
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back, {user?.email}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Competitive Programming Tip</h3>
                <Button variant="outline" size="sm" onClick={loadFact} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    'New Tip'
                  )}
                </Button>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {isLoading && !fact && (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              )}

              {fact && !isLoading && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tip #{fact.Tip.index + 1}</div>
                  <p className="text-lg leading-relaxed">{fact.Tip.tip}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
