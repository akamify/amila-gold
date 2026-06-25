'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getUserSession, setUserSession, clearUserSession, UserSession } from '@/app/lib/session';
import { fetchUserProfile, sendOtp, verifyOtp } from '@/app/lib/apiClient';

const DEFAULT_RETURN_URL = '/user/profile';
const AUTH_RETURN_URL_STORAGE_KEY = 'auth:return-url';

function normalizeReturnUrl(url: string | null | undefined) {
  if (!url || typeof url !== 'string') return DEFAULT_RETURN_URL;
  if (!url.startsWith('/')) return DEFAULT_RETURN_URL;
  if (url.startsWith('//') || url.startsWith('/user/auth')) return DEFAULT_RETURN_URL;
  return url;
}

function persistReturnUrl(url: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_RETURN_URL_STORAGE_KEY, normalizeReturnUrl(url));
}

function readPersistedReturnUrl() {
  if (typeof window === 'undefined') return DEFAULT_RETURN_URL;
  return normalizeReturnUrl(window.localStorage.getItem(AUTH_RETURN_URL_STORAGE_KEY));
}

function clearPersistedReturnUrl() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_RETURN_URL_STORAGE_KEY);
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginStep: 'email' | 'otp';
  loginEmail: string;
  error: string | null;
  returnUrl: string;
  setReturnUrl: (url: string) => void;
  sendLoginOtp: (email: string) => Promise<void>;
  verifyLoginOtp: (otp: string) => Promise<void>;
  completeEmailOtpLogin: (email: string, otp: string) => Promise<UserSession>;
  logout: () => void;
  resetLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [loginEmail, setLoginEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [returnUrlState, setReturnUrlState] = useState(DEFAULT_RETURN_URL);

  useEffect(() => {
    const session = getUserSession();
    setUser(session);
    setReturnUrlState(readPersistedReturnUrl());
    setIsLoading(false);
  }, []);

  const setReturnUrl = useCallback((url: string) => {
    const nextUrl = normalizeReturnUrl(url);
    setReturnUrlState(nextUrl);
    persistReturnUrl(nextUrl);
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;

    const validateAccess = async () => {
      try {
        await fetchUserProfile();
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (!cancelled && /blocked|auth|unauthorized|forbidden/i.test(message)) {
          clearUserSession();
          setUser(null);
          setError(message || 'You are blocked. Please contact support.');
        }
      }
    };

    validateAccess();
    const timer = window.setInterval(validateAccess, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user?.email]);

  const sendLoginOtp = useCallback(async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await sendOtp(email);
      setLoginEmail(email);
      setLoginStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyLoginOtp = useCallback(async (otp: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await verifyOtp(loginEmail, otp);
      const session: UserSession = {
        token: result.token,
        email: result.email,
      };
      setUserSession(session);
      setUser(session);
      setLoginStep('email');
      setLoginEmail('');
      const targetUrl = readPersistedReturnUrl();
      clearPersistedReturnUrl();
      setReturnUrlState(DEFAULT_RETURN_URL);
      window.location.href = targetUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  }, [loginEmail]);

  const completeEmailOtpLogin = useCallback(async (email: string, otp: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      const session: UserSession = {
        token: result.token,
        email: result.email,
      };
      setUserSession(session);
      setUser(session);
      setLoginStep('email');
      setLoginEmail('');
      clearPersistedReturnUrl();
      setReturnUrlState(DEFAULT_RETURN_URL);
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearUserSession();
    clearPersistedReturnUrl();
    setUser(null);
    setLoginStep('email');
    setLoginEmail('');
    setError(null);
    setReturnUrlState(DEFAULT_RETURN_URL);
    window.location.href = '/';
  }, []);

  const resetLogin = useCallback(() => {
    setLoginStep('email');
    setLoginEmail('');
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: Boolean(user?.token && user?.email),
    loginStep,
    loginEmail,
    error,
    returnUrl: returnUrlState,
    setReturnUrl,
    sendLoginOtp,
    verifyLoginOtp,
    completeEmailOtpLogin,
    logout,
    resetLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(redirectPath = '/user/auth') {
  const { isAuthenticated, isLoading, setReturnUrl } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentPath !== redirectPath && !currentPath.startsWith('/user/auth')) {
        setReturnUrl(currentPath);
      }
      if (window.location.pathname !== redirectPath) {
        const authUrl = new URL(redirectPath, window.location.origin);
        if (currentPath !== redirectPath && !currentPath.startsWith('/user/auth')) {
          authUrl.searchParams.set('returnTo', normalizeReturnUrl(currentPath));
        }
        window.location.replace(authUrl.toString());
      }
    }
  }, [isAuthenticated, isLoading, redirectPath, setReturnUrl]);

  return { isAuthenticated, isLoading };
}

// Hook to prevent logged-in users from accessing auth pages
export function useRedirectIfAuth(redirectPath = '/user/profile') {
  const { isAuthenticated, isLoading, setReturnUrl } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryReturnTo = normalizeReturnUrl(searchParams.get('returnTo'));
      const nextUrl = queryReturnTo !== DEFAULT_RETURN_URL
        ? queryReturnTo
        : readPersistedReturnUrl();
      clearPersistedReturnUrl();
      setReturnUrl(DEFAULT_RETURN_URL);
      window.location.replace(nextUrl || redirectPath);
      return;
    }

    if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryReturnTo = searchParams.get('returnTo');
      if (queryReturnTo) {
        setReturnUrl(queryReturnTo);
      }
    }
  }, [isAuthenticated, isLoading, redirectPath, setReturnUrl]);

  return { isAuthenticated, isLoading };
}
