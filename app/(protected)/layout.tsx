'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Shield, LayoutDashboard, LogOut } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <PageSpinner />;
  }

  const isActive = (path: string) => pathname === path;

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
      <div className="relative">
        {/* Navbar */}
        <nav className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 sm:h-9 sm:w-9">
                <Shield className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Sentinel</span>
            </Link>

            {/* Nav Items */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* User email - hidden on mobile */}
              <span className="mr-2 hidden max-w-[150px] truncate text-sm text-zinc-400 md:block lg:max-w-none">
                {user?.email}
              </span>

              {/* Dashboard link */}
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 gap-1.5 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm ${
                    isActive('/dashboard')
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Dashboard</span>
                </Button>
              </Link>

              {/* Sessions link */}
              <Link href="/sessions">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 gap-1.5 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm ${
                    isActive('/sessions')
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Sessions</span>
                </Button>
              </Link>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white sm:h-9 sm:px-3 sm:text-sm"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Logout</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="container mx-auto px-4 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
