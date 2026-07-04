'use client';

import { useEffect, useState } from 'react';
import {
  createAdminTestimonial,
  deleteAdminTestimonial,
  fetchAdminTestimonials,
  updateAdminTestimonial,
  type AdminTestimonial,
} from '@/app/lib/apiClient';

type FormState = {
  quote: string;
  name: string;
  role: string;
  order: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  quote: '',
  name: '',
  role: '',
  order: '0',
  isActive: true,
};

const HOMEPAGE_PUBLIC_CACHE_KEY = 'amila_homepage_public_cache_v1';
const TESTIMONIALS_STORAGE_KEY = 'sr_testimonials';

function clearPublicTestimonialCaches() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(HOMEPAGE_PUBLIC_CACHE_KEY);
  window.localStorage.removeItem(TESTIMONIALS_STORAGE_KEY);
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const rows = await fetchAdminTestimonials();
      setItems(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId('');
    setError('');
    setMessage('');
  };

  const startEdit = (item: AdminTestimonial) => {
    setEditingId(item.id);
    setForm({
      quote: item.quote,
      name: item.name,
      role: item.role,
      order: String(item.order),
      isActive: item.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const quote = form.quote.trim();
    const name = form.name.trim();
    if (!quote || !name) {
      setError('Quote and name are required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const payload = {
        quote,
        name,
        role: form.role.trim(),
        order: Number(form.order || 0),
        isActive: form.isActive,
      };
      if (editingId) {
        await updateAdminTestimonial(editingId, payload);
        setMessage('Testimonial updated successfully.');
      } else {
        await createAdminTestimonial(payload);
        setMessage('Testimonial created successfully.');
      }
      clearPublicTestimonialCaches();
      await load();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    const ok = window.confirm('Delete this testimonial permanently?');
    if (!ok) return;
    try {
      setDeletingId(id);
      setError('');
      await deleteAdminTestimonial(id);
      clearPublicTestimonialCaches();
      setMessage('Testimonial removed.');
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto p-4 md:p-8 text-slate-900 dark:text-slate-100 animate-in fade-in duration-700">
      {/* --- HEADER --- */}
      <header className="relative">
        <div className="absolute -left-4 top-0 w-1 h-12 bg-red-700 rounded-full shadow-[0_0_15px_rgba(var(--red-700-rgb),0.5)]" />
        <p className="font-headline text-[10px] tracking-[0.4em] text-red-700 uppercase font-bold">Content Management</p>
        <h1 className="font-brand text-5xl md:text-6xl tracking-tighter mt-2 bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-white/40 bg-clip-text text-transparent italic font-black">
          Testimonials
        </h1>
        <p className="text-slate-600 dark:text-white/40 text-sm mt-4 max-w-2xl leading-relaxed">
          Curate the voice of your customers. Active testimonials appear in the homepage carousel sorted by display order.
        </p>
      </header>

      {/* --- NOTIFICATIONS --- */}
      <div className="space-y-3">
        {error && (
          <div className="group border border-red-500/20 bg-red-500/5 px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-left">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-medium text-red-400 tracking-wide">{error}</p>
          </div>
        )}
        {message && (
          <div className="group border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-left">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-medium text-emerald-400 tracking-wide">{message}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* --- FORM SECTION --- */}
        <div className="flex-start sticky top-5 col-span-5">
          <form 
            onSubmit={onSubmit} 
            className="sticky top-8 border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0d0f] p-8 rounded-3xl shadow-2xl space-y-6 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-700/5 blur-[50px] -z-10" />
            
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-[10px] tracking-[0.2em] uppercase text-slate-600 dark:text-white/60 font-bold">
                {editingId ? 'Edit Entry' : 'New Entry'}
              </h2>
              {editingId && (
                 <span className="w-2 h-2 rounded-full bg-red-700 animate-ping" />
              )}
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold ml-1">The Quote</span>
              <textarea
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                rows={5}
                placeholder="Write the customer experience here..."
                className="bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 transition-all outline-none resize-none leading-relaxed"
                required
              />
            </label>

            <div className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold ml-1">Customer Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe"
                  className="bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-700/50 transition-all outline-none"
                  required
                />
              </label>
              
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold ml-1">Designation / Role</span>
                <input
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="CEO, TechCorp"
                  className="bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-700/50 transition-all outline-none"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold ml-1">Order</span>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  className="bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm w-24 text-center focus:border-red-700/50 transition-all outline-none font-mono"
                />
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group mt-6">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="peer hidden"
                  />
                  <div className="w-10 h-5 bg-slate-300 dark:bg-white/10 rounded-full peer-checked:bg-red-700/30 transition-all" />
                  <div className="absolute top-1 left-1 w-3 h-3 bg-slate-600 dark:bg-white/40 rounded-full peer-checked:left-6 peer-checked:bg-red-700 transition-all shadow-sm" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white/80 transition-colors">Active</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-white text-black hover:bg-red-700 hover:text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-white/5"
              >
                {saving ? 'Processing...' : editingId ? 'Update Record' : 'Publish Now'}
              </button>
              {editingId ? (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="px-6 py-4 border border-slate-300 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-4 mb-8">
             <h2 className="font-headline text-xs tracking-[0.3em] uppercase text-slate-500 dark:text-white/30 font-black">Live Inventory</h2>
             <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
              <div className="w-8 h-8 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] tracking-widest uppercase font-bold">Fetching Data</p>
            </div>
          ) : items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-white/5 rounded-3xl py-20 text-center">
              <p className="text-slate-500 dark:text-white/20 text-xs tracking-widest uppercase font-bold">No records found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`group relative border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0d0d0f]/50 backdrop-blur-sm rounded-3xl p-6 transition-all hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#0d0d0f] ${
                    editingId === item.id ? 'ring-2 ring-red-700/40 border-transparent' : ''
                  }`}
                >
                  <div className="absolute top-6 left-6 text-red-700/20 scale-150">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V9C10.017 7.89543 10.9124 7 12.017 7H19.017C20.1216 7 21.017 7.89543 21.017 9V15C21.017 17.2091 19.2261 19 17.017 19H14.017V21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H5.017C4.46472 8 4.017 8.44772 4.017 9V12C4.017 12.5523 3.56928 13 3.017 13H0.017C-0.535282 13 -1.017 12.5523 -1.017 12V9C-1.017 7.89543 -0.121573 7 0.983002 7H8.017C9.12157 7 10.017 7.89543 10.017 9V15C10.017 17.2091 8.22614 19 6.017 19H3.017V21H3.017Z"/></svg>
                  </div>

                  <div className="pl-10 space-y-4">
                    <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed font-light italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    
                    <div className="flex flex-wrap justify-between items-end gap-4 border-t border-slate-200 dark:border-white/5 pt-4">
                      <div>
                        <h4 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">{item.name}</h4>
                        <p className="text-[10px] tracking-widest text-red-700/60 font-bold uppercase mt-0.5">{item.role || 'Client'}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[9px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 font-mono">Order {item.order}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-white/10'}`} />
                          <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-30">{item.isActive ? 'Live' : 'Hidden'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2.5 rounded-xl border border-slate-300 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-red-700 hover:border-red-700 hover:text-white transition-all group/btn"
                        >
                          <svg className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2.5 rounded-xl border border-slate-300 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all group/btn disabled:opacity-30"
                        >
                          {deletingId === item.id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
