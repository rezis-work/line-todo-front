import { api } from './client';
import type {
  UserProfileResponse,
  UpdateUserInput,
  ChangePasswordInput,
} from '@/types/api';

/**
 * Get current user profile with extended information
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  return api.get<UserProfileResponse>('/users/me');
}

/**
 * Update user profile (name)
 */
export async function updateUserProfile(
  input: UpdateUserInput
): Promise<UserProfileResponse> {
  return api.patch<UserProfileResponse>('/users/me', input);
}

/**
 * Change user password
 */
export async function changeUserPassword(
  input: ChangePasswordInput
): Promise<void> {
  return api.patch<void>('/users/me/password', input);
}

