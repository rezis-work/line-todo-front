import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as tokenStore from '@/lib/auth/token-store';
import { normalizeApiError } from '../errors';
import type { ApiResponse, RefreshResponse } from '@/types/api';

// We need to import the client after mocks are set up
// So we'll dynamically import it in each test

// Mock token store
vi.mock('@/lib/auth/token-store', () => ({
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

// Mock env
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3000',
  },
}));

describe('API Client', () => {
  let apiClient: AxiosInstance;
  let mockAxiosInstance: AxiosInstance;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create a real axios instance for testing
    mockAxiosInstance = axios.create({
      baseURL: 'http://localhost:3000',
    });

    // Dynamically import client to get fresh instance
    const clientModule = await import('../client');
    apiClient = clientModule.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should attach Authorization header when access token exists', async () => {
      vi.mocked(tokenStore.getAccessToken).mockReturnValue('test-access-token');

      // Make a request - the interceptor should add the header
      const requestConfig = apiClient.interceptors.request.handlers[0]?.fulfilled;

      if (requestConfig) {
        const config = {
          headers: {},
          url: '/test',
        };

        const result = await requestConfig(config);

        expect(result.headers?.Authorization).toBe('Bearer test-access-token');
      }
    });

    it('should not attach Authorization header when access token is missing', async () => {
      vi.mocked(tokenStore.getAccessToken).mockReturnValue(null);

      const requestConfig = apiClient.interceptors.request.handlers[0]?.fulfilled;

      if (requestConfig) {
        const config = {
          headers: {},
          url: '/test',
        };

        const result = await requestConfig(config);

        expect(result.headers?.Authorization).toBeUndefined();
      }
    });
  });

  describe('Error Normalization', () => {
    it('should normalize backend error format correctly', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation error',
              statusCode: 400,
              requestId: 'test-request-id',
              code: 'VALIDATION_ERROR',
            },
          },
        },
      } as AxiosError;

      const normalized = normalizeApiError(error);

      expect(normalized).toEqual({
        message: 'Validation error',
        statusCode: 400,
        requestId: 'test-request-id',
        code: 'VALIDATION_ERROR',
      });
    });

    it('should handle network errors', () => {
      const error = {
        message: 'Network Error',
        response: undefined,
      } as AxiosError;

      const normalized = normalizeApiError(error);

      expect(normalized.statusCode).toBe(0);
      expect(normalized.message).toContain('Network');
    });

    it('should handle generic errors with fallback message', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      } as AxiosError;

      const normalized = normalizeApiError(error);

      expect(normalized.statusCode).toBe(500);
      expect(normalized.message).toBeDefined();
    });

    it('should handle string error responses', () => {
      const error = {
        response: {
          status: 400,
          data: 'Bad Request',
        },
      } as AxiosError;

      const normalized = normalizeApiError(error);

      expect(normalized.message).toBe('Bad Request');
      expect(normalized.statusCode).toBe(400);
    });
  });

  describe('Single-Flight Refresh Logic', () => {
    beforeEach(() => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          href: '',
        },
        writable: true,
      });
    });

    it('should make only one refresh request when multiple 401s occur simultaneously', async () => {
      const refreshToken = 'test-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      vi.mocked(tokenStore.getAccessToken).mockReturnValue('old-access-token');
      vi.mocked(tokenStore.getRefreshToken).mockReturnValue(refreshToken);

      // Mock axios.post for refresh endpoint
      const originalPost = axios.post;
      let refreshCallCount = 0;

      vi.spyOn(axios, 'post').mockImplementation((url, data) => {
        if (url === 'http://localhost:3000/auth/refresh') {
          refreshCallCount++;
          return Promise.resolve({
            data: {
              data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              },
            },
          } as { data: ApiResponse<RefreshResponse> });
        }
        return originalPost(url, data);
      });

      // Mock apiClient.get to fail with 401, then succeed
      let callCount = 0;
      vi.spyOn(apiClient, 'get').mockImplementation((url) => {
        callCount++;
        if (callCount === 1) {
          // First call fails with 401
          const error = {
            response: {
              status: 401,
              data: { error: { message: 'Unauthorized', statusCode: 401 } },
            },
            config: { url, _retry: false },
          } as AxiosError;
          return Promise.reject(error);
        }
        // After refresh, succeed
        return Promise.resolve({
          data: { data: { success: true } },
        });
      });

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;

      if (responseInterceptor) {
        const error1 = {
          response: {
            status: 401,
            data: { error: { message: 'Unauthorized', statusCode: 401 } },
          },
          config: { url: '/test1', _retry: false },
        } as AxiosError;

        const error2 = {
          response: {
            status: 401,
            data: { error: { message: 'Unauthorized', statusCode: 401 } },
          },
          config: { url: '/test2', _retry: false },
        } as AxiosError;

        const error3 = {
          response: {
            status: 401,
            data: { error: { message: 'Unauthorized', statusCode: 401 } },
          },
          config: { url: '/test3', _retry: false },
        } as AxiosError;

        // Simulate simultaneous 401s
        const promises = [
          responseInterceptor(error1).catch(() => {}),
          responseInterceptor(error2).catch(() => {}),
          responseInterceptor(error3).catch(() => {}),
        ];

        await Promise.allSettled(promises);

        // Verify refresh was called only once
        expect(refreshCallCount).toBe(1);
        expect(tokenStore.setTokens).toHaveBeenCalledWith({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }
    });

    it('should redirect to login when refresh token is missing', async () => {
      vi.mocked(tokenStore.getAccessToken).mockReturnValue('old-access-token');
      vi.mocked(tokenStore.getRefreshToken).mockReturnValue(null);

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;

      if (responseInterceptor) {
        const error = {
          response: {
            status: 401,
            data: { error: { message: 'Unauthorized', statusCode: 401 } },
          },
          config: { url: '/test', _retry: false },
        } as AxiosError;

        await expect(responseInterceptor(error)).rejects.toBeDefined();

        expect(tokenStore.clearTokens).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');
      }
    });

    it('should reject all queued requests when refresh fails', async () => {
      const refreshToken = 'test-refresh-token';

      vi.mocked(tokenStore.getAccessToken).mockReturnValue('old-access-token');
      vi.mocked(tokenStore.getRefreshToken).mockReturnValue(refreshToken);

      // Mock axios.post to fail
      const originalPost = axios.post;
      vi.spyOn(axios, 'post').mockImplementation((url) => {
        if (url === 'http://localhost:3000/auth/refresh') {
          return Promise.reject({
            response: {
              status: 401,
              data: {
                error: {
                  message: 'Invalid refresh token',
                  statusCode: 401,
                },
              },
            },
          } as AxiosError);
        }
        return originalPost(url);
      });

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;

      if (responseInterceptor) {
        const error1 = {
          response: {
            status: 401,
            data: { error: { message: 'Unauthorized', statusCode: 401 } },
          },
          config: { url: '/test1', _retry: false },
        } as AxiosError;

        const error2 = {
          response: {
            status: 401,
            data: { error: { message: 'Unauthorized', statusCode: 401 } },
          },
          config: { url: '/test2', _retry: false },
        } as AxiosError;

        // Simulate multiple simultaneous 401s
        const promises = [
          responseInterceptor(error1),
          responseInterceptor(error2),
        ];

        const results = await Promise.allSettled(promises);

        // All should be rejected
        expect(results[0].status).toBe('rejected');
        expect(results[1].status).toBe('rejected');

        // Tokens should be cleared
        expect(tokenStore.clearTokens).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');
      }
    });
  });
});
