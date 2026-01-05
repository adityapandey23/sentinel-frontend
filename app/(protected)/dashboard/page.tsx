'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { factsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/errors';
import type { FactResponse } from '@/types';
import { Lightbulb, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
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
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-zinc-400 sm:text-base">
          Welcome back, <span className="font-medium text-zinc-200">{user?.email}</span>
        </p>
      </div>

      {/* Programming Tip Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Lightbulb className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold sm:text-xl">Programming Tip</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFact}
            disabled={isLoading}
            className="h-9 w-full gap-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white sm:w-auto"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                New Tip
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {isLoading && !fact && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {fact && !isLoading && (
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
              Tip #{fact.Tip.index + 1}
            </span>
            <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">{fact.Tip.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}
