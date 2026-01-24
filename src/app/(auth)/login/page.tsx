'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useLogin, useMeQuery } from '@/hooks/useAuth';
import { isAuthenticated, clearTokens } from '@/lib/auth/token-store';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const login = useLogin();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  
  // Only query user if token exists (to verify it's valid)
  const { data: user, isLoading: isLoadingUser, isError: isUserError } = useMeQuery();

  // Always call hooks unconditionally (Rules of Hooks)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    setMounted(true);
    setHasToken(isAuthenticated());
  }, []);

  // Update hasToken when it changes
  useEffect(() => {
    if (mounted) {
      setHasToken(isAuthenticated());
    }
  }, [mounted]);

  // Clear invalid tokens if user query fails
  useEffect(() => {
    if (mounted && hasToken && isUserError) {
      clearTokens();
      setHasToken(false);
    }
  }, [mounted, hasToken, isUserError]);

  // Redirect if already authenticated (user data loaded successfully)
  // Only redirect if we're on the login page
  useEffect(() => {
    if (mounted && hasToken && user && pathname === '/login') {
      router.push('/');
    }
  }, [mounted, hasToken, user, pathname, router]);

  // Don't render form if already authenticated and user data loaded
  if (!mounted || (hasToken && user)) {
    return null;
  }

  // Show loading while checking auth
  if (hasToken && isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={login.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={login.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
