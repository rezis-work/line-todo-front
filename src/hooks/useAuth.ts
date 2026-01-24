'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { register, login, logout, getMe } from '@/lib/api/auth';
import { setTokens, clearTokens } from '@/lib/auth/token-store';
import type {
  RegisterInput,
  LoginInput,
  LogoutInput,
  AuthResponse,
  User,
} from '@/types/api';
import { useToast } from './use-toast';
import { isAuthenticated } from '@/lib/auth/token-store';
import type { ApiError } from '@/types/api';
import { isApiError } from '@/lib/api/errors';

/**
 * Query hook to get current user
 */
export function useMeQuery() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication directly instead of using state
  // This ensures the query enables/disables immediately when tokens change
  const hasToken = mounted && isAuthenticated();

  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: hasToken,
    retry: false,
  });
}

/**
 * Mutation hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: register,
    onSuccess: (data) => {
      // Store tokens
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      // Redirect to app
      router.push('/');

      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to create account';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: login,
    onSuccess: (data) => {
      // Store tokens
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      // Redirect to app
      router.push('/');

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to login';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<void, Error, LogoutInput>({
    mutationFn: logout,
    onSuccess: () => {
      // Clear tokens
      clearTokens();

      // Clear all queries
      queryClient.clear();

      // Redirect to login (router.push handles navigation)
      router.push('/login');

      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      // Even if logout fails, clear local state
      clearTokens();
      queryClient.clear();
      router.push('/login');

      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to logout';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

