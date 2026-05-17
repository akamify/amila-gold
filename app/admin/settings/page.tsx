'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Save, X, Globe, ShieldCheck, Share2, LogOut, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import {
    adminLogout,
    adminResetPassword,
    // createAdminInstagramGalleryItem,
    // deleteAdminInstagramGalleryItem,
    fetchAdminSiteSettings,
    uploadAdminSiteLogo,
    updateAdminSiteSettings,
    type SiteSettings,
} from '@/app/lib/apiClient';
import { clearAdminSession, getAdminUsername } from '@/app/lib/adminSession';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';

type SettingsForm = {
    siteName: string;
    navbarTitle: string;
    footerTitle: string;
    footerDescription: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
    emailFooterDescription: string;
    currencySymbol: string;
    instagramUrl: string;
    instagramHandle: string;
    youtubeUrl: string;
    facebookUrl: string;
};

type SocialUrlField = 'instagramUrl' | 'youtubeUrl' | 'facebookUrl';

type InstagramGalleryItem = SiteSettings['instagramGallery'][number];

const SOCIAL_FIELD_META: Record<SocialUrlField, { label: string; hosts: string[] }> = {
    instagramUrl: { label: 'Instagram', hosts: ['instagram.com', 'instagr.am'] },
    youtubeUrl: { label: 'YouTube', hosts: ['youtube.com', 'youtu.be'] },
    facebookUrl: { label: 'Facebook', hosts: ['facebook.com', 'fb.com'] },
};

const normalizeSocialUrl = (value: string) => {
    const input = String(value || '').trim();
    if (!input) return '';
    if (/^https?:\/\//i.test(input)) return input;
    return `https://${input}`;
};

const hasAllowedSocialHost = (hostname: string, allowedHosts: string[]) => {
    const safeHost = String(hostname || '').toLowerCase();
    return allowedHosts.some((domain) => safeHost === domain || safeHost.endsWith(`.${domain}`));
};

const validateSocialUrls = (form: SettingsForm) => {
    const nextValues: Pick<SettingsForm, SocialUrlField> = {
        instagramUrl: '',
        youtubeUrl: '',
        facebookUrl: '',
    };
    const problems: string[] = [];
    (Object.keys(SOCIAL_FIELD_META) as SocialUrlField[]).forEach((field) => {
        const meta = SOCIAL_FIELD_META[field];
        const normalized = normalizeSocialUrl(form[field]);
        if (!normalized) {
            nextValues[field] = '';
            return;
        }
        let parsed: URL;
        try {
            parsed = new URL(normalized);
        } catch {
            problems.push(`${meta.label} URL is invalid.`);
            return;
        }
        if (parsed.protocol !== 'https:') {
            problems.push(`${meta.label} URL must start with https://.`);
            return;
        }
        if (!hasAllowedSocialHost(parsed.hostname, meta.hosts)) {
            problems.push(`${meta.label} URL must point to ${meta.hosts.join(' or ')}.`);
            return;
        }
        nextValues[field] = parsed.toString();
    });
    return { nextValues, error: problems.length ? problems.join(' ') : '' };
};

export default function AdminSettings() {
    const username = getAdminUsername() || 'admin';
    const { settings, applyLocalSettings, refreshSettings } = useSiteSettings();

    const [form, setForm] = useState<SettingsForm>({
        siteName: settings.siteName,
        navbarTitle: settings.navbarTitle,
        footerTitle: settings.footerTitle,
        footerDescription: settings.footerDescription,
        companyAddress: settings.companyAddress,
        companyEmail: settings.companyEmail,
        companyPhone: settings.companyPhone,
        emailFooterDescription: settings.emailFooterDescription,
        currencySymbol: settings.currencySymbol,
        instagramUrl: settings.instagramUrl,
        instagramHandle: settings.instagramHandle,
        youtubeUrl: settings.youtubeUrl,
        facebookUrl: settings.facebookUrl,
    });

    // const [instagramItems, setInstagramItems] = useState<InstagramGalleryItem[]>(settings.instagramGallery || []);
    // const [newInstagramUsername, setNewInstagramUsername] = useState(settings.instagramHandle || 'apex_thrill');
    // const [newInstagramFile, setNewInstagramFile] = useState<File | null>(null);
    // const [newInstagramInputKey, setNewInstagramInputKey] = useState(0);
    // const [uploadingInstagram, setUploadingInstagram] = useState(false);
    // const [processingInstagramId, setProcessingInstagramId] = useState<string | null>(null);
    // const [savingInstagramHandle, setSavingInstagramHandle] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoInputKey, setLogoInputKey] = useState(0);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resettingPassword, setResettingPassword] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchAdminSiteSettings();
                setForm({
                    siteName: data.siteName,
                    navbarTitle: data.navbarTitle,
                    footerTitle: data.footerTitle,
                    footerDescription: data.footerDescription,
                    companyAddress: data.companyAddress,
                    companyEmail: data.companyEmail,
                    companyPhone: data.companyPhone,
                    emailFooterDescription: data.emailFooterDescription,
                    currencySymbol: data.currencySymbol,
                    instagramUrl: data.instagramUrl,
                    instagramHandle: data.instagramHandle,
                    youtubeUrl: data.youtubeUrl,
                    facebookUrl: data.facebookUrl,
                });
                
                applyLocalSettings(data);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Could not load settings.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [applyLocalSettings]);

    useEffect(() => {
        if (!logoFile) {
            setLogoPreviewUrl('');
            return;
        }
        const nextPreviewUrl = URL.createObjectURL(logoFile);
        setLogoPreviewUrl(nextPreviewUrl);
        return () => {
            URL.revokeObjectURL(nextPreviewUrl);
        };
    }, [logoFile]);

    const dirty = useMemo(() => {
        return (
            form.siteName !== settings.siteName ||
            form.navbarTitle !== settings.navbarTitle ||
            form.footerTitle !== settings.footerTitle ||
            form.footerDescription !== settings.footerDescription ||
            form.companyAddress !== settings.companyAddress ||
            form.companyEmail !== settings.companyEmail ||
            form.companyPhone !== settings.companyPhone ||
            form.emailFooterDescription !== settings.emailFooterDescription ||
            form.currencySymbol !== settings.currencySymbol ||
            form.instagramUrl !== settings.instagramUrl ||
            form.instagramHandle !== settings.instagramHandle ||
            form.youtubeUrl !== settings.youtubeUrl ||
            form.facebookUrl !== settings.facebookUrl
        );
    }, [form, settings]);

    const updateField = (key: keyof SettingsForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSave = async () => {
        setMessage('');
        setError('');
        const socialValidation = validateSocialUrls(form);
        if (socialValidation.error) {
            setError(socialValidation.error);
            return;
        }
        try {
            setSaving(true);
            const payload = {
                ...form,
                ...socialValidation.nextValues,
                updatedBy: username,
            };
            const updated = await updateAdminSiteSettings(payload);
            applyLocalSettings(updated);
            // setInstagramItems(updated.instagramGallery || []);
            await refreshSettings();
            setMessage('Settings updated successfully.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const onUploadLogo = async () => {
        if (!logoFile) {
            setError('Select a logo image first.');
            return;
        }
        try {
            setUploadingLogo(true);
            setMessage('');
            setError('');
            const updated = await uploadAdminSiteLogo({
                logo: logoFile,
                updatedBy: username,
            });
            applyLocalSettings(updated);
            // setInstagramItems(updated.instagramGallery || []);
            setLogoFile(null);
            setLogoPreviewUrl('');
            setLogoInputKey((prev) => prev + 1);
            await refreshSettings();
            setMessage('Brand logo updated successfully.');
        } catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload brand logo.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const onResetPassword = async () => {
        try {
            setResettingPassword(true);
            setMessage('');
            setError('');
            await adminResetPassword(username, currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setMessage('Admin password updated successfully.');
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : 'Password reset failed.');
        } finally {
            setResettingPassword(false);
        }
    };

    const onLogout = async () => {
        try { await adminLogout(); } catch { }
        clearAdminSession();
        window.location.href = '/admin/login';
    };

    const activeLogoPreview = logoPreviewUrl || settings.logoUrl || '';

    // Reusable Input Component for sleek look
    const InputWrapper = ({ label, children }: { label: string, children: React.ReactNode }) => (
        <div className="flex flex-col gap-1.5 w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</span>
            {children}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-10 text-slate-200">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-red-700 font-bold text-xs tracking-[0.3em] uppercase">
                        <div className="w-8 h-[2px] bg-red-700"></div> Configuration
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white">Site Settings</h2>
                </div>
                <div className="flex gap-4">
                     <button 
                        onClick={onSave} 
                        disabled={loading || saving || !dirty} 
                        className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold transition-all hover:bg-red-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                    >
                        <Save size={18} className={saving ? "" : "group-hover:scale-110 transition-transform"} />
                        {saving ? 'Processing...' : 'Save Configuration'}
                    </button>
                </div>
            </header>

            {/* Notification Area */}
            {(error || message) && (
                <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <p className="text-sm font-medium">{error || message}</p>
                    <button className="ml-auto opacity-50 hover:opacity-100" onClick={() => { setError(''); setMessage(''); }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Branding Section */}
                    <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-red/20 rounded-lg text-red-700"><Globe size={24} /></div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Identity & Branding</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <InputWrapper label="Store Name">
                                <input autoComplete="off" value={form.siteName} onChange={(e) => updateField('siteName', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white placeholder:text-slate-600" placeholder="e.g. Pure Fire" />
                            </InputWrapper>
                            <InputWrapper label="Currency Symbol">
                                <input autoComplete="off" value={form.currencySymbol} onChange={(e) => updateField('currencySymbol', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" />
                            </InputWrapper>
                            <InputWrapper label="Navbar Title">
                                <input autoComplete="off" value={form.navbarTitle} onChange={(e) => updateField('navbarTitle', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" />
                            </InputWrapper>
                            <InputWrapper label="Footer Title">
                                <input autoComplete="off" value={form.footerTitle} onChange={(e) => updateField('footerTitle', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" />
                            </InputWrapper>
                        </div>

                        <div className="space-y-6">
                            <InputWrapper label="Footer Description">
                                <textarea value={form.footerDescription} onChange={(e) => updateField('footerDescription', e.target.value)} rows={3} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" />
                            </InputWrapper>
                            <InputWrapper label="Company Address">
                                <textarea value={form.companyAddress} onChange={(e) => updateField('companyAddress', e.target.value)} rows={2} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" />
                            </InputWrapper>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputWrapper label="Company Email">
                                    <input value={form.companyEmail} onChange={(e) => updateField('companyEmail', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" />
                                </InputWrapper>
                                <InputWrapper label="Company Phone">
                                    <input value={form.companyPhone} onChange={(e) => updateField('companyPhone', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" />
                                </InputWrapper>
                            </div>
                        </div>

                        {/* Logo Upload Box */}
                        <div className="mt-10 p-6 bg-black/40 border border-dashed border-white/20 rounded-2xl">
                             <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                                        {activeLogoPreview ? (
                                            <Image src={activeLogoPreview} alt="logo preview" width={100} height={100} unoptimized className="object-contain p-2" />
                                        ) : (
                                            <UploadCloud className="text-white/20" size={32} />
                                        )}
                                    </div>
                                    {activeLogoPreview && <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-black"><CheckCircle2 size={12} /></div>}
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="text-center md:text-left">
                                        <h4 className="text-white font-bold">Brand Mark</h4>
                                        <p className="text-xs text-slate-400 mt-1">Recommended size 512x512px. Transparent PNG preferred.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <input key={logoInputKey} type="file" accept="image/*" id="logo-upload" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                                        <label htmlFor="logo-upload" className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all border border-white/10">
                                            Choose Image
                                        </label>
                                        <button onClick={onUploadLogo} disabled={uploadingLogo || !logoFile} className="bg-red-700 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all hover:shadow-lg hover:shadow-red-700/20 disabled:opacity-30">
                                            {uploadingLogo ? 'Uploading...' : 'Update Logo'}
                                        </button>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </section>

                    {/* Social Media Section */}
                    <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Share2 size={24} /></div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Social Connectivity</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputWrapper label="Instagram Profile URL">
                                <input value={form.instagramUrl} onChange={(e) => updateField('instagramUrl', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" placeholder="https://instagram.com/yourhandle" />
                            </InputWrapper>
                            <InputWrapper label="YouTube Channel URL">
                                <input value={form.youtubeUrl} onChange={(e) => updateField('youtubeUrl', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" placeholder="https://youtube.com/@yourchannel" />
                            </InputWrapper>
                            <InputWrapper label="Facebook Page URL">
                                <input value={form.facebookUrl} onChange={(e) => updateField('facebookUrl', e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-700/50 transition-all text-white" placeholder="https://facebook.com/yourpage" />
                            </InputWrapper>
                        </div>
                    </section>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    
                    {/* Security Card */}
                    <section className="bg-[#111112] border border-white/10 rounded-3xl p-8 overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
                            <ShieldCheck size={120} />
                         </div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><ShieldCheck size={20} /></div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Security & Access</h3>
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                            <button onClick={onResetPassword} disabled={resettingPassword || !currentPassword || !newPassword} className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold border border-white/10 transition-all disabled:opacity-20">
                                {resettingPassword ? 'Processing...' : 'Change Password'}
                            </button>
                            <div className="h-[1px] bg-white/10 my-2"></div>
                            <button onClick={onLogout} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl text-xs font-bold border border-red-500/20 transition-all flex items-center justify-center gap-2">
                                <LogOut size={14} /> Sign Out Session
                            </button>
                        </div>
                    </section>

                    {/* Quick Preview Card */}
                    <section className="bg-red-700 rounded-3xl p-8 text-white shadow-2xl shadow-red-700/20 group">
                        <h3 className="text-xl font-bold tracking-tight mb-6 flex justify-between items-center">
                            Live Preview
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-center justify-center h-24 mb-6">
                                {activeLogoPreview ? (
                                    <Image src={activeLogoPreview} alt="preview" width={140} height={40} unoptimized className="object-contain" />
                                ) : (
                                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Logo Placeholder</span>
                                )}
                            </div>
                            <div className="space-y-3 opacity-90">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">Navbar</span>
                                    <span className="text-xs font-medium">{form.navbarTitle || '—'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">Footer</span>
                                    <span className="text-xs font-medium">{form.footerTitle || '—'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">Currency</span>
                                    <span className="text-xs font-medium">{form.currencySymbol || '$'}</span>
                                </div>
                                <div className="pt-2 text-[10px] italic opacity-60 leading-relaxed truncate">
                                    {form.companyAddress || 'No address set'}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            
            {/* Bottom Floating Action (Optional if needed) */}
            <div className="fixed bottom-8 right-8 z-50 md:hidden">
                 <button onClick={onSave} disabled={loading || saving || !dirty} className="bg-red-700 text-white p-5 rounded-full shadow-2xl disabled:opacity-50">
                    <Save size={24} />
                 </button>
            </div>
        </div>
    );
}