'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  getUserSession,
  setUserSession,
  clearUserSession,
  UserSession,
  USER_SESSION_CHANGED_EVENT,
} from '@/app/lib/session';
import { fetchUserProfile, sendOtp, verifyOtp } from '@/app/lib/apiClient';

const DEFAULT_RETURN_URL = '/user/profile';
const AUTH_RETURN_URL_STORAGE_KEY = 'auth:return-url';
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_FAILED_ATTEMPTS = 3;
const OTP_ATTEMPT_COOLDOWN_SECONDS = 30;
const MAX_TIMEOUT_MS = 2_147_483_647;

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
  resendRemainingSeconds: number;
  otpAttemptCooldownSeconds: number;
  otpAttemptsLeft: number;
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
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(0);
  const [otpFailedAttempts, setOtpFailedAttempts] = useState(0);
  const [otpAttemptCooldownUntil, setOtpAttemptCooldownUntil] = useState(0);
  const [otpAttemptCooldownSeconds, setOtpAttemptCooldownSeconds] = useState(0);

  useEffect(() => {
    const syncSession = () => setUser(getUserSession());

    syncSession();
    setReturnUrlState(readPersistedReturnUrl());
    setIsLoading(false);

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('streetriot_user_')) {
        syncSession();
      }
    };

    window.addEventListener(USER_SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(USER_SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setReturnUrl = useCallback((url: string) => {
    const nextUrl = normalizeReturnUrl(url);
    setReturnUrlState(nextUrl);
    persistReturnUrl(nextUrl);
  }, []);

  useEffect(() => {
    const updateOtpTimers = () => {
      const now = Date.now();
      setResendRemainingSeconds(Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)));
      setOtpAttemptCooldownSeconds(Math.max(0, Math.ceil((otpAttemptCooldownUntil - now) / 1000)));
    };

    updateOtpTimers();
    if (!resendAvailableAt && !otpAttemptCooldownUntil) return;

    const timer = window.setInterval(updateOtpTimers, 250);
    return () => window.clearInterval(timer);
  }, [otpAttemptCooldownUntil, resendAvailableAt]);

  useEffect(() => {
    if (!user?.expiresAt) return;

    const expiresMs = Date.parse(user.expiresAt);
    if (!Number.isFinite(expiresMs)) return;

    const delay = expiresMs - Date.now();
    if (delay <= 0) {
      clearUserSession();
      setUser(null);
      return;
    }

    const timer = window.setTimeout(() => {
      clearUserSession();
      setUser(null);
    }, Math.min(delay, MAX_TIMEOUT_MS));

    return () => window.clearTimeout(timer);
  }, [user?.expiresAt, user?.token]);

  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;
    const tokenAtStart = user.token;

    const validateAccess = async () => {
      try {
        const data = await fetchUserProfile();
        const expiresAt = typeof data.expiresAt === 'string' ? data.expiresAt : '';
        const latestSession = getUserSession();
        if (!cancelled && expiresAt && latestSession?.token === tokenAtStart && latestSession.expiresAt !== expiresAt) {
          const refreshedSession = { ...latestSession, expiresAt };
          setUserSession(refreshedSession);
          setUser(refreshedSession);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        const latestSession = getUserSession();
        if (
          !cancelled &&
          latestSession?.token === tokenAtStart &&
          /blocked|token|session|expired|auth|unauthorized|forbidden|mismatch/i.test(message)
        ) {
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
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return;

    const validateOnReturn = () => {
      if (document.visibilityState === 'visible') {
        fetchUserProfile().then((data) => {
          const expiresAt = typeof data.expiresAt === 'string' ? data.expiresAt : '';
          const latestSession = getUserSession();
          if (expiresAt && latestSession?.token === user.token && latestSession.expiresAt !== expiresAt) {
            const refreshedSession = { ...latestSession, expiresAt };
            setUserSession(refreshedSession);
            setUser(refreshedSession);
          }
        }).catch((err) => {
          const message = err instanceof Error ? err.message : '';
          const latestSession = getUserSession();
          if (
            latestSession?.token === user.token &&
            /blocked|token|session|expired|auth|unauthorized|forbidden|mismatch/i.test(message)
          ) {
            clearUserSession();
            setUser(null);
          }
        });
      }
    };

    window.addEventListener('focus', validateOnReturn);
    document.addEventListener('visibilitychange', validateOnReturn);
    return () => {
      window.removeEventListener('focus', validateOnReturn);
      document.removeEventListener('visibilitychange', validateOnReturn);
    };
  }, [user?.token]);

  const sendLoginOtp = useCallback(async (email: string) => {
    setError(null);
    if (Date.now() < resendAvailableAt) {
      setError(`Please wait ${Math.ceil((resendAvailableAt - Date.now()) / 1000)}s before resending OTP.`);
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(email);
      setLoginEmail(email);
      setLoginStep('otp');
      setOtpFailedAttempts(0);
      setOtpAttemptCooldownUntil(0);
      setResendAvailableAt(Date.now() + OTP_RESEND_SECONDS * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  }, [resendAvailableAt]);

  const verifyLoginOtp = useCallback(async (otp: string) => {
    setError(null);
    if (Date.now() < otpAttemptCooldownUntil) {
      setError(`Too many wrong OTP attempts. Try again in ${Math.ceil((otpAttemptCooldownUntil - Date.now()) / 1000)}s.`);
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(loginEmail, otp);
      const session: UserSession = {
        token: result.token,
        email: result.email,
        expiresAt: result.expiresAt,
      };
      setUserSession(session);
      setUser(session);
      setLoginStep('email');
      setLoginEmail('');
      setOtpFailedAttempts(0);
      setOtpAttemptCooldownUntil(0);
      setResendAvailableAt(0);
      const targetUrl = readPersistedReturnUrl();
      clearPersistedReturnUrl();
      setReturnUrlState(DEFAULT_RETURN_URL);
      window.location.href = targetUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      if (/too many wrong otp attempts/i.test(message)) {
        const secondsMatch = message.match(/(\d+)\s*seconds?/i);
        const cooldownSeconds = secondsMatch ? Number(secondsMatch[1]) : OTP_ATTEMPT_COOLDOWN_SECONDS;
        setOtpFailedAttempts(0);
        setOtpAttemptCooldownUntil(Date.now() + Math.max(1, cooldownSeconds) * 1000);
        setError(message);
      } else if (/invalid otp/i.test(message)) {
        const nextAttempts = otpFailedAttempts + 1;
        if (nextAttempts >= OTP_MAX_FAILED_ATTEMPTS) {
          setOtpFailedAttempts(0);
          setOtpAttemptCooldownUntil(Date.now() + OTP_ATTEMPT_COOLDOWN_SECONDS * 1000);
          setError(`Too many wrong OTP attempts. Try again in ${OTP_ATTEMPT_COOLDOWN_SECONDS}s.`);
        } else {
          setOtpFailedAttempts(nextAttempts);
          setError(`${message}. ${OTP_MAX_FAILED_ATTEMPTS - nextAttempts} attempt${OTP_MAX_FAILED_ATTEMPTS - nextAttempts === 1 ? '' : 's'} left.`);
        }
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loginEmail, otpAttemptCooldownUntil, otpFailedAttempts]);

  const completeEmailOtpLogin = useCallback(async (email: string, otp: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      const session: UserSession = {
        token: result.token,
        email: result.email,
        expiresAt: result.expiresAt,
      };
      setUserSession(session);
      setUser(session);
      setLoginStep('email');
      setLoginEmail('');
      setOtpFailedAttempts(0);
      setOtpAttemptCooldownUntil(0);
      setResendAvailableAt(0);
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
    setOtpFailedAttempts(0);
    setOtpAttemptCooldownUntil(0);
    setResendAvailableAt(0);
    setError(null);
    setReturnUrlState(DEFAULT_RETURN_URL);
    window.location.href = '/';
  }, []);

  const resetLogin = useCallback(() => {
    setLoginStep('email');
    setLoginEmail('');
    setOtpFailedAttempts(0);
    setOtpAttemptCooldownUntil(0);
    setResendAvailableAt(0);
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: Boolean(user?.token && user?.email),
    loginStep,
    loginEmail,
    error,
    resendRemainingSeconds,
    otpAttemptCooldownSeconds,
    otpAttemptsLeft: Math.max(0, OTP_MAX_FAILED_ATTEMPTS - otpFailedAttempts),
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
