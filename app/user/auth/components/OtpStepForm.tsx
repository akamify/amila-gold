'use client';

type OtpStepFormProps = {
  otp: string;
  isLoading: boolean;
  error: string | null;
  resendRemainingSeconds: number;
  otpAttemptCooldownSeconds: number;
  otpAttemptsLeft: number;
  onOtpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  onBack: () => void;
};

export default function OtpStepForm({
  otp,
  isLoading,
  error,
  resendRemainingSeconds,
  otpAttemptCooldownSeconds,
  otpAttemptsLeft,
  onOtpChange,
  onSubmit,
  onResend,
  onBack,
}: OtpStepFormProps) {
  const verifyDisabled = isLoading || otp.length !== 6 || otpAttemptCooldownSeconds > 0;
  const resendDisabled = isLoading || resendRemainingSeconds > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="group relative">
        <label className="text-[11px] uppercase tracking-[0.15em] text-on-surface-variant/80 font-semibold mb-2 block text-center transition-colors group-focus-within:text-primary">
          6-Digit Security Code
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
          maxLength={6}
          className="w-full bg-surface-variant/20 border border-outline-variant/30 rounded-2xl px-5 py-4 text-center text-2xl font-bold tracking-[0.8em] text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 placeholder:text-on-surface-variant/20"
          required
        />
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">
          <span>
            {otpAttemptCooldownSeconds > 0
              ? `Retry in ${otpAttemptCooldownSeconds}s`
              : `${otpAttemptsLeft} OTP attempt${otpAttemptsLeft === 1 ? '' : 's'} left`}
          </span>
          <button
            type="button"
            onClick={onResend}
            disabled={resendDisabled}
            className="text-primary transition-colors hover:text-primary/70 disabled:text-on-surface-variant/35"
          >
            {resendRemainingSeconds > 0 ? `Resend in ${resendRemainingSeconds}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error text-xs p-3 rounded-xl text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          type="submit"
          disabled={verifyDisabled}
          className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-[0.12em] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : otpAttemptCooldownSeconds > 0 ? `Wait ${otpAttemptCooldownSeconds}s` : 'Verify Access'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-on-surface-variant/60 text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-colors py-2"
        >
          Use different email
        </button>
      </div>
    </form>
  );
}
