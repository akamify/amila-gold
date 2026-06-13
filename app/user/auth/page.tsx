'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth, useRedirectIfAuth } from '@/app/context/AuthContext';
import AuthHeader from './components/AuthHeader';
import EmailStepForm from './components/EmailStepForm';
import OtpStepForm from './components/OtpStepForm';

export default function UserAuthPage() {
  const {
    loginStep,
    loginEmail,
    isLoading,
    error,
    sendLoginOtp,
    verifyLoginOtp,
    resetLogin,
  } = useAuth();
  const [blockedFlag, setBlockedFlag] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useRedirectIfAuth('/user/profile');

  useEffect(() => {
    setBlockedFlag(new URLSearchParams(window.location.search).get('blocked') === '1');
  }, []);

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim()) await sendLoginOtp(email.trim());
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.trim()) await verifyLoginOtp(otp.trim());
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-surface px-4 py-8 font-['Poppins'] sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,440px)]">
        <div className="relative hidden min-h-[560px] items-center justify-center overflow-hidden rounded-[3rem] p-10 lg:flex">
          <Image
            src="/auth.svg"
            alt="Secure account authentication"
            width={720}
            height={720}
            priority
            className="h-auto max-h-[520px] w-full object-contain"
          />
        </div>

        <div className="w-full transition-all duration-500">
          <AuthHeader loginStep={loginStep} loginEmail={loginEmail} />

          {blockedFlag && !error && (
            <div className="mb-6 animate-pulse rounded-2xl border border-error/20 bg-error/10 p-4 text-center text-xs text-error">
              You are blocked. Please contact support.
            </div>
          )}

          <div className="transition-all duration-300 ease-in-out">
            {loginStep === 'email' ? (
              <EmailStepForm
                email={email}
                isLoading={isLoading}
                error={error}
                onEmailChange={setEmail}
                onSubmit={handleSendOtp}
              />
            ) : (
              <OtpStepForm
                otp={otp}
                isLoading={isLoading}
                error={error}
                onOtpChange={setOtp}
                onSubmit={handleVerifyOtp}
                onBack={resetLogin}
              />
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant/60 transition-all duration-300 hover:text-primary"
            >
              <span className="text-lg">←</span> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
