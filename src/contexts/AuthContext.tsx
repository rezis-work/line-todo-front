'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useMeQuery } from '@/hooks/useAuth';
import type { User } from '@/types/api';

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  isError: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useMeQuery();

  return (
    <AuthContext.Provider value={{ user, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

