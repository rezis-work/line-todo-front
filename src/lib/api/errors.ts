import { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

/**
 * Backend error response format
 */
interface BackendErrorResponse {
  error: {
    message: string;
    statusCode: number;
    requestId?: string;
    code?: string;
    details?: unknown;
    stack?: string; // Only in development
  };
}

/**
 * Normalize Axios errors to UI-safe ApiError format
 */
export function normalizeApiError(error: AxiosError): ApiError {
  // Handle network errors (no response)
  if (!error.response) {
    return {
      message: error.message || 'Network error. Please check your connection.',
      statusCode: 0,
      requestId: undefined,
    };
  }

  const { status, data } = error.response;

  // Try to extract backend error format
  const backendError = (data as BackendErrorResponse)?.error;

  if (backendError) {
    return {
      message: backendError.message || 'An error occurred',
      statusCode: backendError.statusCode || status,
      requestId: backendError.requestId,
      code: backendError.code,
      details: backendError.details,
    };
  }

  // Fallback: extract message from response data if it's a string
  if (typeof data === 'string') {
    return {
      message: data || 'An error occurred',
      statusCode: status,
    };
  }

  // Fallback: extract message from error object if present
  if (data && typeof data === 'object' && 'message' in data) {
    return {
      message: String(data.message) || 'An error occurred',
      statusCode: status,
    };
  }

  // Generic fallback
  return {
    message: error.message || 'An unexpected error occurred',
    statusCode: status,
  };
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error &&
    typeof (error as ApiError).message === 'string' &&
    typeof (error as ApiError).statusCode === 'number'
  );
}

