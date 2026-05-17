'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    fetchAdminContactSubmissions,
    fetchAdminNewsletterSubscribers,
    markAdminContactSolved,
    type ContactSubmission,
    type NewsletterSubscriber,
} from '@/app/lib/apiClient';
import { getAdminUsername } from '@/app/lib/adminSession';
import ContactSubmissionCard from '@/app/admin/communications/components/ContactSubmissionCard';
import SubscribersTable from '@/app/admin/communications/components/SubscribersTable';

export default function AdminCommunicationsPage() {
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState('');
    const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'subscribers' | 'contacts'>('subscribers');

    const [subscriberQuery, setSubscriberQuery] = useState('');
    const [subscriberStatusFilter, setSubscriberStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [subscriberSort, setSubscriberSort] = useState<'recent' | 'email' | 'status'>('recent');

    const [contactQuery, setContactQuery] = useState('');
    const [contactStatusFilter, setContactStatusFilter] = useState<'all' | 'open' | 'solved'>('all');
    const [contactSort, setContactSort] = useState<'recent' | 'status' | 'name'>('recent');

    const load = async (options?: { silent?: boolean }) => {
        const silent = options?.silent === true;
        try {
            if (!silent) setLoading(true);
            setError('');
            const [subscriberData, contactData] = await Promise.all([
                fetchAdminNewsletterSubscribers(),
                fetchAdminContactSubmissions(),
            ]);
            setSubscribers(subscriberData.subscribers);
            setContacts(contactData.contacts);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Could not load communications data.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            load({ silent: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const stats = useMemo(() => {
        const open = contacts.filter((item) => item.status === 'open').length;
        const solved = contacts.filter((item) => item.status === 'solved').length;
        const activeSubs = subscribers.filter((item) => item.isActive).length;
        return {
            totalSubs: subscribers.length,
            activeSubs,
            open,
            solved,
        };
    }, [contacts, subscribers]);

    const onMarkSolved = async (contactId: string) => {
        const solvedBy = getAdminUsername() || 'admin';
        try {
            setProcessingId(contactId);
            setError('');
            setMessage('');

            await markAdminContactSolved(contactId, {
                solvedBy,
                resolutionMessage: resolutionDrafts[contactId] || '',
            });

            await load();
            setMessage('Contact marked as solved and customer email sent.');
        } catch (solveError) {
            setError(solveError instanceof Error ? solveError.message : 'Failed to mark contact solved.');
        } finally {
            setProcessingId('');
        }
    };

    const onRefresh = async () => {
        await load();
    };

    const filteredSubscribers = useMemo(() => {
        const query = subscriberQuery.trim().toLowerCase();
        return subscribers
            .filter((item) => {
                if (subscriberStatusFilter === 'active' && !item.isActive) return false;
                if (subscriberStatusFilter === 'inactive' && item.isActive) return false;
                if (query && !item.email.toLowerCase().includes(query)) return false;
                return true;
            })
            .sort((a, b) => {
                if (subscriberSort === 'email') return a.email.localeCompare(b.email);
                if (subscriberSort === 'status') return Number(b.isActive) - Number(a.isActive);
                const aDate = a.subscribedAt ? new Date(a.subscribedAt).getTime() : 0;
                const bDate = b.subscribedAt ? new Date(b.subscribedAt).getTime() : 0;
                return bDate - aDate;
            });
    }, [subscribers, subscriberQuery, subscriberStatusFilter, subscriberSort]);

    const filteredContacts = useMemo(() => {
        const query = contactQuery.trim().toLowerCase();
        return contacts
            .filter((item) => {
                if (contactStatusFilter !== 'all' && item.status !== contactStatusFilter) return false;
                if (query && !(item.email.toLowerCase().includes(query) || item.name.toLowerCase().includes(query))) return false;
                return true;
            })
            .sort((a, b) => {
                if (contactSort === 'name') return a.name.localeCompare(b.name);
                if (contactSort === 'status') return a.status.localeCompare(b.status);
                const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bDate - aDate;
            });
    }, [contacts, contactQuery, contactStatusFilter, contactSort]);

    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto p-4 md:p-8 text-slate-100 animate-in fade-in duration-700">
            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-700 animate-pulse shadow-[0_0_10px_rgba(var(--red-700-rgb),0.8)]" />
                        <span className="font-headline text-[10px] md:text-xs tracking-[0.5em] text-red-700 uppercase font-black">
                            Communication Control
                        </span>
                    </div>
                    <h2 className="font-brand text-5xl md:text-7xl leading-none tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">
                        Desk Manager
                    </h2>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="group relative px-6 py-3 bg-[#0d0d0f] border border-white/10 overflow-hidden rounded-xl transition-all active:scale-95"
                >
                    <div className="absolute inset-0 bg-red-700/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative font-headline text-[10px] tracking-[0.2em] font-bold">
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </span>
                </button>
            </header>

            {/* --- FEEDBACK ALERTS --- */}
            <div className="space-y-3 empty:hidden">
                {error && (
                    <div className="border-l-4 border-red-500 bg-red-500/5 px-6 py-4 rounded-r-2xl animate-shake">
                        <p className="font-headline text-[11px] tracking-widest text-red-400 font-bold uppercase italic">{error}</p>
                    </div>
                )}
                {message && (
                    <div className="border-l-4 border-emerald-500 bg-emerald-500/5 px-6 py-4 rounded-r-2xl animate-in slide-in-from-left">
                        <p className="font-headline text-[11px] tracking-widest text-emerald-400 font-bold uppercase italic">{message}</p>
                    </div>
                )}
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Subscribers', value: stats.totalSubs, color: 'text-white' },
                    { label: 'Active Status', value: stats.activeSubs, color: 'text-red-700' },
                    { label: 'Open Queries', value: stats.open, color: 'text-[#ff929d]' },
                    { label: 'Solved Archive', value: stats.solved, color: 'text-emerald-400' }
                ].map((stat, i) => (
                    <div key={i} className="group relative bg-[#0d0d0f] border border-white/5 p-6 rounded-2xl hover:border-red-700/50 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-700/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="font-headline text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold">{stat.label}</p>
                        <p className={`font-brand text-5xl mt-6 tracking-tighter ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* --- MAIN INTERFACE --- */}
            <section className="bg-[#0d0d0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* TABS */}
                <div className="flex flex-col md:flex-row border-b border-white/5 bg-black/20">
                    <button
                        onClick={() => setActiveTab('subscribers')}
                        className={`flex-1 px-8 py-6 font-headline text-[11px] tracking-[0.3em] uppercase font-black transition-all ${
                            activeTab === 'subscribers' 
                            ? 'text-red-700 bg-red-700/5 border-b-2 border-red-700' 
                            : 'text-white/40 hover:text-white hover:bg-white/5 border-b-2 border-transparent'
                        }`}
                    >
                        Newsletter Engine
                    </button>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex-1 px-8 py-6 font-headline text-[11px] tracking-[0.3em] uppercase font-black transition-all ${
                            activeTab === 'contacts' 
                            ? 'text-red-700 bg-red-700/5 border-b-2 border-red-700' 
                            : 'text-white/40 hover:text-white hover:bg-white/5 border-b-2 border-transparent'
                        }`}
                    >
                        Contact Inbound
                    </button>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                    {/* FILTERS TOOLBAR */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                            <div className="relative w-full md:w-80">
                                <input
                                    value={activeTab === 'subscribers' ? subscriberQuery : contactQuery}
                                    onChange={(e) => activeTab === 'subscribers' ? setSubscriberQuery(e.target.value) : setContactQuery(e.target.value)}
                                    placeholder={activeTab === 'subscribers' ? "Search by email address..." : "Search by name or email..."}
                                    className="w-full bg-black/40 border border-white/10 px-5 py-3 rounded-xl font-headline text-[10px] tracking-widest uppercase focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700/20 transition-all"
                                />
                            </div>

                            <select
                                value={activeTab === 'subscribers' ? subscriberStatusFilter : contactStatusFilter}
                                onChange={(e) => activeTab === 'subscribers' 
                                    ? setSubscriberStatusFilter(e.target.value as any) 
                                    : setContactStatusFilter(e.target.value as any)
                                }
                                className="bg-black/40 border border-white/10 px-4 py-3 rounded-xl font-headline text-[10px] tracking-widest uppercase focus:outline-none transition-all cursor-pointer hover:bg-black/60"
                            >
                                <option value="all">Status: All</option>
                                {activeTab === 'subscribers' ? (
                                    <>
                                        <option value="active">Active Only</option>
                                        <option value="inactive">Inactive Only</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="open">Status: Open</option>
                                        <option value="solved">Status: Solved</option>
                                    </>
                                )}
                            </select>

                            <select
                                value={activeTab === 'subscribers' ? subscriberSort : contactSort}
                                onChange={(e) => activeTab === 'subscribers'
                                    ? setSubscriberSort(e.target.value as any)
                                    : setContactSort(e.target.value as any)
                                }
                                className="bg-black/40 border border-white/10 px-4 py-3 rounded-xl font-headline text-[10px] tracking-widest uppercase focus:outline-none transition-all cursor-pointer hover:bg-black/60"
                            >
                                <option value="recent">Sort: Newest</option>
                                {activeTab === 'subscribers' ? (
                                    <>
                                        <option value="email">Sort: Alphabetical</option>
                                        <option value="status">Sort: Vitality</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="status">Sort: Status</option>
                                        <option value="name">Sort: Name</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4 animate-pulse">
                                <div className="w-12 h-12 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                                <span className="font-headline text-[10px] tracking-[0.4em] uppercase text-white/20">Syncing...</span>
                            </div>
                        ) : activeTab === 'subscribers' ? (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                {filteredSubscribers.length === 0 ? (
                                    <EmptyState message="No subscribers detected in this frequency." />
                                ) : (
                                    <div className="rounded-2xl overflow-hidden border border-white/5">
                                        <SubscribersTable subscribers={filteredSubscribers} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                {filteredContacts.length === 0 ? (
                                    <EmptyState message="Inbound signals are currently silent." />
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {filteredContacts.map((contact) => (
                                            <div key={contact.id} className="transition-all duration-300 hover:-translate-y-1">
                                                <ContactSubmissionCard
                                                    contact={contact}
                                                    draftValue={resolutionDrafts[contact.id] || ''}
                                                    busy={processingId === contact.id}
                                                    onDraftChange={(value) =>
                                                        setResolutionDrafts((prev) => ({ ...prev, [contact.id]: value }))
                                                    }
                                                    onMarkSolved={() => onMarkSolved(contact.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="font-headline text-[11px] tracking-[0.3em] uppercase text-white/30 font-bold italic">{message}</p>
        </div>
    );
}