import { api } from './client';
import type {
  RegisterInput,
  LoginInput,
  LogoutInput,
  AuthResponse,
  User,
} from '@/types/api';

/**
 * Register a new user
 */
export async function register(
  input: RegisterInput
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', input);
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', input);
}

/**
 * Logout user
 */
export async function logout(input: LogoutInput): Promise<void> {
  return api.post<void>('/auth/logout', input);
}

/**
 * Get current user
 */
export async function getMe(): Promise<User> {
  return api.get<User>('/auth/me');
}

