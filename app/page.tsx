'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Shield, Monitor, ArrowRight, Lock, Eye } from 'lucide-react';

export default function LandingPage() {
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
      <div className="relative">
        {/* Nav */}
        <nav className="container mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Sentinel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <main className="container mx-auto px-6 pt-24 pb-32 text-center">
          <div className="mx-auto max-w-3xl">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <Lock className="h-3.5 w-3.5" />
              Secure Session Management
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Know where you&apos;re{' '}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                signed in
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed">
              Monitor and manage your active sessions across all devices. 
              See who&apos;s accessing your account and revoke access instantly.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="h-12 gap-2 bg-emerald-500 px-8 text-base hover:bg-emerald-600">
                  Start for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-zinc-700 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mx-auto mt-32 grid max-w-4xl gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={<Eye className="h-6 w-6" />}
              title="Real-time Visibility"
              description="See all active sessions with device, location, and browser details"
            />
            <FeatureCard
              icon={<Monitor className="h-6 w-6" />}
              title="Multi-device Support"
              description="Track sessions across desktop, mobile, and tablet devices"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Instant Revocation"
              description="End suspicious sessions with a single click from anywhere"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
          <p>Built with care. Your security matters.</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}