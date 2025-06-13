'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

const MOCK_USER: MockUser = {
  id: 'mock-user-id',
  email: 'demo@example.com',
  user_metadata: {
    name: 'Demo User'
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setUser(MOCK_USER);
      setLoading(false);
    }, 500);
  }, []);

  // TODO: 今はモックだが後で本実装する
  // oxlint-disable-next-line no-unused-vars
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(MOCK_USER);
    setLoading(false);
    router.push('/dashboard');
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = {
      ...MOCK_USER,
      email,
      user_metadata: { name }
    };
    setUser(newUser);
    setLoading(false);
    router.push('/dashboard');
  };

  const signOut = async () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};