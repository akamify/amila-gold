'use client';

import { useState } from 'react';
import Link from 'next/link';
import { adminLogin, adminResetPassword } from '@/app/lib/apiClient';
import { setAdminSession } from '@/app/lib/adminSession';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const onLogin = async () => {
        setLoading(true);
        setMessage('');
        try {
            const data = await adminLogin(username, password);
            const token = String(data.token || '');
            if (!token) throw new Error('Admin token missing');
            setAdminSession(token, String(data.username || username));
            window.location.href = '/admin';
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const onReset = async () => {
        setLoading(true);
        setMessage('');
        try {
            await adminResetPassword(username, currentPassword, newPassword);
            setIsResetMode(false);
            setMessage('Password reset successful. Login now.');
            setPassword('');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#111] text-white flex items-center justify-center px-4">
            <section className="w-full max-w-lg bg-[#1c1b1b] border border-[#ffffff]/10 p-8 md:p-10">
                <Link href="/" className="font-headline text-[10px] tracking-widest opacity-60 hover:opacity-100">
                    Back to Store
                </Link>
                <h1 className="font-brand text-6xl mt-5 mb-4">Admin Access</h1>

                <div className="space-y-4">
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-[#0f0f0f] border border-[#ffffff]/15 px-4 py-3 font-headline text-sm tracking-widest focus:outline-none focus:border-[#b90c1b]" />

                    {!isResetMode ? (
                        <>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-[#0f0f0f] border border-[#ffffff]/15 px-4 py-3 font-headline text-sm tracking-widest focus:outline-none focus:border-[#b90c1b]" />
                            <button onClick={onLogin} disabled={loading} className="w-full bg-[#b90c1b] py-3 font-headline text-[11px] tracking-widest hover:bg-[#d21628] disabled:opacity-50">
                                {loading ? 'Signing In...' : 'Login'}
                            </button>
                        </>
                    ) : (
                        <>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-[#0f0f0f] border border-[#ffffff]/15 px-4 py-3 font-headline text-sm tracking-widest focus:outline-none focus:border-[#b90c1b]" />
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full bg-[#0f0f0f] border border-[#ffffff]/15 px-4 py-3 font-headline text-sm tracking-widest focus:outline-none focus:border-[#b90c1b]" />
                            <button onClick={onReset} disabled={loading} className="w-full border border-[#ffffff]/20 py-3 font-headline text-[11px] tracking-widest hover:bg-[#ffffff]/10 disabled:opacity-50">
                                {loading ? 'Updating...' : 'Reset Password'}
                            </button>
                        </>
                    )}

                    <button type="button" onClick={() => setIsResetMode((v) => !v)} className="font-headline text-[10px] tracking-widest opacity-70 hover:opacity-100">
                        {isResetMode ? 'Back to Login' : 'Reset Password'}
                    </button>

                    {message && <p className="font-headline text-[10px] tracking-widest text-[#ff8a95]">{message}</p>}
                </div>
            </section>
        </main>
    );
}
