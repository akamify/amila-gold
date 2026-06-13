'use client';

type AuthHeaderProps = {
  loginStep: 'email' | 'otp';
  loginEmail: string;
};

export default function AuthHeader({ loginStep, loginEmail }: AuthHeaderProps) {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-3">
        {loginStep === 'email' ? 'Welcome' : 'Verify Identity'}
      </h1>
      <p className="text-on-surface-variant/70 text-sm leading-relaxed">
        {loginStep === 'email'
          ? 'Experience the next level of security. Enter your email to begin.'
          : `We've sent a code to ${loginEmail}`}
      </p>
    </div>
  );
}