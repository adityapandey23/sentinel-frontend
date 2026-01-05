'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PageSpinner } from '@/components/ui/spinner';
import { Shield } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <PageSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 sm:h-12 sm:w-12">
            <Shield className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <span className="text-xl font-semibold tracking-tight sm:text-2xl">Sentinel</span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
