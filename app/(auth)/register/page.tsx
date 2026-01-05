'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/errors';
import { User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register({ name, email, password });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create Account</h1>
        <p className="text-sm text-zinc-400">Sign up for Sentinel</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 border-zinc-700 bg-zinc-800/50 pl-10 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 border-zinc-700 bg-zinc-800/50 pl-10 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 border-zinc-700 bg-zinc-800/50 pl-10 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-emerald-500 text-white hover:bg-emerald-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-400">Already have an account? </span>
        <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
          Sign in
        </Link>
      </div>
    </>
  );
}
