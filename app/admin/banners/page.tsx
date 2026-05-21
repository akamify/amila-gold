'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createAdminBanner,
  deleteAdminBanner,
  fetchAdminBanners,
  type AdminBanner,
  updateAdminBanner,
} from '@/app/lib/apiClient';

type BannerFormState = {
  title: string;
  subtitle: string;
  targetUrl: string;
  imageUrl: string;
  order: string;
  isActive: boolean;
  imageFile: File | null;
};

const initialForm: BannerFormState = {
  title: '',
  subtitle: '',
  targetUrl: '',
  imageUrl: '',
  order: '0',
  isActive: true,
  imageFile: null,
};

export default function AdminBannersPage() {
  const [items, setItems] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<BannerFormState>(initialForm);

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) || null,
    [items, editingId]
  );

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const rows = await fetchAdminBanners();
      setItems(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
    setError('');
    setMessage('');
  };

  const validateForm = () => {
    if (!form.targetUrl.trim()) {
      return 'Target URL is required.';
    }
    if (!form.imageFile && !form.imageUrl.trim() && !editingItem?.imageUrl) {
      return 'Banner image is required.';
    }
    return '';
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        targetUrl: form.targetUrl.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        order: Number(form.order || 0),
        isActive: form.isActive,
        image: form.imageFile || undefined,
      };

      if (editingId) {
        await updateAdminBanner(editingId, payload);
        setMessage('Banner updated successfully.');
      } else {
        await createAdminBanner(payload);
        setMessage('New banner published.');
      }

      await load();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (item: AdminBanner) => {
    setEditingId(item.id);
    setError('');
    setMessage('');
    setForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      targetUrl: item.targetUrl || '',
      imageUrl: item.imageUrl || '',
      order: String(item.order ?? 0),
      isActive: item.isActive !== false,
      imageFile: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      setDeletingId(id);
      setError('');
      setMessage('');
      await deleteAdminBanner(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      setMessage('Banner removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-8 px-4 text-slate-100 animate-in fade-in duration-500">
      {/* --- Header Section --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-brand text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            Banners
          </h1>
          <p className="mt-2 text-slate-400 text-sm font-medium tracking-wide">
            Design and manage your homepage hero experience.
          </p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent hidden md:block mb-4 mx-8" />
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-red-700 font-bold bg-red-700/10 px-3 py-1 rounded-full border border-red-700/20">
          Live Editor
        </div>
      </header>

      {/* --- Form Section --- */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-700/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <form
          onSubmit={onSubmit}
          className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl"
        >
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Banner Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Summer Collection 2026"
              className="w-full bg-black/50 border border-white/5 focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 px-4 py-3 rounded-xl transition-all outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Subtitle / Description</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="Up to 50% off on all items"
              className="w-full bg-black/50 border border-white/5 focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 px-4 py-3 rounded-xl transition-all outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Redirect Link</label>
            <input
              value={form.targetUrl}
              onChange={(e) => setForm((p) => ({ ...p, targetUrl: e.target.value }))}
              placeholder="/collections/new-arrivals"
              className="w-full bg-black/50 border border-white/5 focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 px-4 py-3 rounded-xl transition-all outline-none text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Display Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
              className="w-full bg-black/50 border border-white/5 focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 px-4 py-3 rounded-xl transition-all outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">External Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://images.com/banner.jpg"
              className="w-full bg-black/50 border border-white/5 focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 px-4 py-3 rounded-xl transition-all outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Upload New Asset</label>
            <div className="relative group/file">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-white/5 file:text-white hover:file:bg-white/10 transition-all cursor-pointer bg-black/50 border border-white/5 py-1.5 px-2 rounded-xl"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            <label className="flex items-center gap-3 cursor-pointer group/check w-fit">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="peer appearance-none w-5 h-5 border border-white/20 rounded-md checked:bg-red-700 checked:border-red-700 transition-all"
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-400 group-hover/check:text-white transition-colors">Visible on Homepage</span>
            </label>

            <div className="flex items-center gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
                >
                  Discard
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-white/5 active:scale-95 flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                {editingId ? 'Update Asset' : 'Publish Banner'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* --- Feedback Messages --- */}
      <div className="empty:hidden">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs animate-shake">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}
        {message && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs animate-in slide-in-from-top-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {message}
          </div>
        )}
      </div>

      {/* --- List Section --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">Live Inventory</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`group flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl border transition-all duration-300 ${editingId === item.id
                    ? 'bg-red-700/5 border-red-700/40 ring-1 ring-red-700/20'
                    : 'bg-[#0d0d0f]/50 border-white/5 hover:border-white/20'
                  }`}
              >
                <div className="relative w-full md:w-60 h-32 rounded-xl overflow-hidden bg-black ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-widest italic">No Preview</div>
                  )}
                  {!item.isActive && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 rotate-12 border-2 border-white/20 px-4 py-1">Disabled</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1 text-center md:text-left min-w-0">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h3 className="font-headline text-lg font-bold tracking-tight text-white">{item.title}</h3>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-400 font-mono">Pos: {item.order}</span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">{item.subtitle}</p>
                  <p className="text-[11px] text-red-700/60 font-mono truncate hover:text-red-700 transition-colors cursor-default">{item.targetUrl}</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => beginEdit(item)}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 active:scale-95"
                  >
                    {deletingId === item.id ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="py-20 text-center rounded-2xl border-2 border-dashed border-white/5">
                <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">The gallery is currently empty</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}