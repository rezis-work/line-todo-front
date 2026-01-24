'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '@/lib/api/users';
import type {
  UserProfileResponse,
  UpdateUserInput,
  ChangePasswordInput,
} from '@/types/api';
import { useToast } from './use-toast';
import type { ApiError } from '@/types/api';
import { isApiError } from '@/lib/api/errors';
import { clearTokens } from '@/lib/auth/token-store';

/**
 * Query hook to get current user profile with extended information
 */
export function useUserProfile() {
  return useQuery<UserProfileResponse>({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  });
}

/**
 * Mutation hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserProfileResponse, Error, UpdateUserInput>({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      // Invalidate both user profile and auth queries to keep AuthContext in sync
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to update profile';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for changing user password
 */
export function useChangePassword() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<void, Error, ChangePasswordInput>({
    mutationFn: changeUserPassword,
    onSuccess: () => {
      // Backend revokes all tokens on password change
      // Clear tokens and queries, then redirect to login
      clearTokens();
      queryClient.clear();

      toast({
        title: 'Success',
        description: 'Password changed successfully. Please log in again.',
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    },
    onError: (error: Error | ApiError) => {
      // Handle 401 errors (token revoked) by redirecting to login
      if (isApiError(error) && error.statusCode === 401) {
        clearTokens();
        queryClient.clear();
        router.push('/login');
        toast({
          title: 'Session Expired',
          description: 'Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to change password';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

