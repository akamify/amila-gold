"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Filter,
  Inbox,
  Loader2,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  fetchAdminContactSubmissions,
  fetchAdminNewsletterSubscribers,
  markAdminContactSolved,
  type ContactSubmission,
  type NewsletterSubscriber,
} from "@/app/lib/apiClient";
import { getAdminUsername } from "@/app/lib/adminSession";
import ContactSubmissionCard from "@/app/admin/communications/components/ContactSubmissionCard";
import SubscribersTable from "@/app/admin/communications/components/SubscribersTable";

type ActiveTab = "subscribers" | "contacts";
type SubscriberStatusFilter = "all" | "active" | "inactive";
type SubscriberSort = "recent" | "email" | "status";
type ContactStatusFilter = "all" | "open" | "solved";
type ContactSort = "recent" | "status" | "name";

function toTime(value?: string | null) {
  if (!value) return 0;

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function normalizeText(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function StatCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  helper: string;
  icon: ReactNode;
  tone?: "default" | "red" | "green" | "blue" | "amber";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "green"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : tone === "blue"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : tone === "amber"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-white text-slate-700";

  return (
    <div
      className={`rounded-[14px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white/75 shadow-sm">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs font-bold text-slate-500">{helper}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[14px] border border-slate-200 bg-white p-4"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_150px] md:items-center">
            <div className="grid gap-2">
              <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-80 max-w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-48 max-w-full animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-10 animate-pulse rounded bg-slate-100 md:block" />
            <div className="hidden h-10 animate-pulse rounded bg-slate-100 md:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-[14px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>

      <p className="mt-4 text-sm font-black text-slate-700">{title}</p>

      <p className="mt-1 max-w-md text-xs font-medium leading-5 text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default function AdminCommunicationsPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [resolutionDrafts, setResolutionDrafts] = useState<
    Record<string, string>
  >({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("subscribers");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const [subscriberQuery, setSubscriberQuery] = useState("");
  const [subscriberStatusFilter, setSubscriberStatusFilter] =
    useState<SubscriberStatusFilter>("all");
  const [subscriberSort, setSubscriberSort] =
    useState<SubscriberSort>("recent");

  const [contactQuery, setContactQuery] = useState("");
  const [contactStatusFilter, setContactStatusFilter] =
    useState<ContactStatusFilter>("all");
  const [contactSort, setContactSort] = useState<ContactSort>("recent");

  const load = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [subscriberData, contactData] = await Promise.all([
        fetchAdminNewsletterSubscribers(),
        fetchAdminContactSubmissions(),
      ]);

      setSubscribers(Array.isArray(subscriberData.subscribers) ? subscriberData.subscribers : []);
      setContacts(Array.isArray(contactData.contacts) ? contactData.contacts : []);
      setLastSyncedAt(new Date());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load communications data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      load({ silent: true });
    }, 30000);

    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => setMessage(""), 3500);

    return () => window.clearTimeout(timeout);
  }, [message]);

  const stats = useMemo(() => {
    const open = contacts.filter(
      (item) => normalizeText(item.status) === "open",
    ).length;
    const solved = contacts.filter(
      (item) => normalizeText(item.status) === "solved",
    ).length;
    const activeSubs = subscribers.filter((item) => Boolean(item.isActive)).length;

    return {
      totalSubs: subscribers.length,
      activeSubs,
      inactiveSubs: Math.max(0, subscribers.length - activeSubs),
      open,
      solved,
    };
  }, [contacts, subscribers]);

  const onMarkSolved = async (contactId: string) => {
    const solvedBy = getAdminUsername() || "admin";

    try {
      setProcessingId(contactId);
      setError("");
      setMessage("");

      await markAdminContactSolved(contactId, {
        solvedBy,
        resolutionMessage: resolutionDrafts[contactId] || "",
      });

      setResolutionDrafts((prev) => {
        const next = { ...prev };
        delete next[contactId];
        return next;
      });

      await load();
      setMessage("Contact marked as solved and customer email sent.");
    } catch (solveError) {
      setError(
        solveError instanceof Error
          ? solveError.message
          : "Failed to mark contact solved.",
      );
    } finally {
      setProcessingId("");
    }
  };

  const onRefresh = async () => {
    await load();
  };

  const filteredSubscribers = useMemo(() => {
    const query = subscriberQuery.trim().toLowerCase();

    return subscribers
      .filter((item) => {
        const isActive = Boolean(item.isActive);
        const email = normalizeText(item.email);

        if (subscriberStatusFilter === "active" && !isActive) return false;
        if (subscriberStatusFilter === "inactive" && isActive) return false;
        if (query && !email.includes(query)) return false;

        return true;
      })
      .sort((a, b) => {
        if (subscriberSort === "email") {
          return String(a.email || "").localeCompare(String(b.email || ""));
        }

        if (subscriberSort === "status") {
          return Number(Boolean(b.isActive)) - Number(Boolean(a.isActive));
        }

        return toTime(b.subscribedAt) - toTime(a.subscribedAt);
      });
  }, [subscribers, subscriberQuery, subscriberStatusFilter, subscriberSort]);

  const filteredContacts = useMemo(() => {
    const query = contactQuery.trim().toLowerCase();

    return contacts
      .filter((item) => {
        const status = normalizeText(item.status);
        const email = normalizeText(item.email);
        const name = normalizeText(item.name);
        const record = item as unknown as Record<string, unknown>;
        const subject = normalizeText(record.subject);
        const phone = normalizeText(record.phone);
        const userMessage = normalizeText(record.message);

        if (contactStatusFilter !== "all" && status !== contactStatusFilter) {
          return false;
        }

        if (
          query &&
          ![email, name, subject, phone, userMessage].some((value) =>
            value.includes(query),
          )
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (contactSort === "name") {
          return String(a.name || "").localeCompare(String(b.name || ""));
        }

        if (contactSort === "status") {
          const statusWeight: Record<string, number> = {
            open: 0,
            solved: 1,
          };

          return (
            (statusWeight[normalizeText(a.status)] ?? 9) -
            (statusWeight[normalizeText(b.status)] ?? 9)
          );
        }

        return toTime(b.createdAt) - toTime(a.createdAt);
      });
  }, [contacts, contactQuery, contactStatusFilter, contactSort]);

  const activeQuery =
    activeTab === "subscribers" ? subscriberQuery : contactQuery;
  const hasActiveFilters =
    activeTab === "subscribers"
      ? Boolean(subscriberQuery || subscriberStatusFilter !== "all" || subscriberSort !== "recent")
      : Boolean(contactQuery || contactStatusFilter !== "all" || contactSort !== "recent");

  const clearCurrentFilters = () => {
    if (activeTab === "subscribers") {
      setSubscriberQuery("");
      setSubscriberStatusFilter("all");
      setSubscriberSort("recent");
      return;
    }

    setContactQuery("");
    setContactStatusFilter("all");
    setContactSort("recent");
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 text-slate-900 md:p-6">
      <header className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-600">
                Communication Control
              </p>
            </div>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">
              Desk Manager
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Manage newsletter subscribers and inbound customer contact queries
              from one stable admin workspace.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            {lastSyncedAt ? (
              <span className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500">
                <Clock3 size={14} />
                Synced {lastSyncedAt.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : null}

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading || refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.1em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                strokeWidth={2.6}
                className={loading || refreshing ? "animate-spin" : ""}
              />
              {loading || refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {(error || message) && (
        <div className="grid gap-3">
          {error ? (
            <div className="flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {message ? (
            <div className="flex items-start gap-3 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          ) : null}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Subscribers"
          value={stats.totalSubs}
          helper={`${stats.inactiveSubs} inactive subscriber(s)`}
          icon={<Users size={20} strokeWidth={2.5} />}
          tone="blue"
        />

        <StatCard
          label="Active Subscribers"
          value={stats.activeSubs}
          helper="Newsletter receiving users"
          icon={<Mail size={20} strokeWidth={2.5} />}
          tone="green"
        />

        <StatCard
          label="Open Queries"
          value={stats.open}
          helper="Needs admin action"
          icon={<Inbox size={20} strokeWidth={2.5} />}
          tone="red"
        />

        <StatCard
          label="Solved Queries"
          value={stats.solved}
          helper="Completed contact requests"
          icon={<UserCheck size={20} strokeWidth={2.5} />}
          tone="amber"
        />
      </div>

      <section className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
        <div className="grid border-b border-slate-200 bg-slate-50/70 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab("subscribers")}
            className={`flex items-center justify-center gap-2 px-4 py-4 text-xs font-black uppercase tracking-[0.14em] transition ${
              activeTab === "subscribers"
                ? "border-b-2 border-red-600 bg-white text-red-700"
                : "border-b-2 border-transparent text-slate-500 hover:bg-white hover:text-slate-950"
            }`}
          >
            <Send size={15} strokeWidth={2.6} />
            Newsletter Engine
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              {filteredSubscribers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center justify-center gap-2 px-4 py-4 text-xs font-black uppercase tracking-[0.14em] transition ${
              activeTab === "contacts"
                ? "border-b-2 border-red-600 bg-white text-red-700"
                : "border-b-2 border-transparent text-slate-500 hover:bg-white hover:text-slate-950"
            }`}
          >
            <MessageSquareText size={15} strokeWidth={2.6} />
            Contact Inbound
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              {filteredContacts.length}
            </span>
          </button>
        </div>

        <div className="border-b border-slate-200 bg-white p-4 md:p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto]">
            <label className="relative block">
              <Search
                size={16}
                strokeWidth={2.6}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={activeQuery}
                onChange={(event) => {
                  if (activeTab === "subscribers") {
                    setSubscriberQuery(event.target.value);
                  } else {
                    setContactQuery(event.target.value);
                  }
                }}
                placeholder={
                  activeTab === "subscribers"
                    ? "Search by subscriber email..."
                    : "Search by customer name, email, phone or message..."
                }
                className="h-11 w-full rounded-[12px] border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2 xl:flex">
              <label className="relative block">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={
                    activeTab === "subscribers"
                      ? subscriberStatusFilter
                      : contactStatusFilter
                  }
                  onChange={(event) => {
                    if (activeTab === "subscribers") {
                      setSubscriberStatusFilter(
                        event.target.value as SubscriberStatusFilter,
                      );
                    } else {
                      setContactStatusFilter(
                        event.target.value as ContactStatusFilter,
                      );
                    }
                  }}
                  className="h-11 w-full appearance-none rounded-[12px] border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-black uppercase tracking-[0.08em] text-slate-600 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5 xl:w-[170px]"
                >
                  <option value="all">Status: All</option>
                  {activeTab === "subscribers" ? (
                    <>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </>
                  ) : (
                    <>
                      <option value="open">Open Only</option>
                      <option value="solved">Solved Only</option>
                    </>
                  )}
                </select>
              </label>

              <label className="relative block">
                <SlidersHorizontal
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={activeTab === "subscribers" ? subscriberSort : contactSort}
                  onChange={(event) => {
                    if (activeTab === "subscribers") {
                      setSubscriberSort(event.target.value as SubscriberSort);
                    } else {
                      setContactSort(event.target.value as ContactSort);
                    }
                  }}
                  className="h-11 w-full appearance-none rounded-[12px] border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-black uppercase tracking-[0.08em] text-slate-600 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5 xl:w-[170px]"
                >
                  <option value="recent">Sort: Newest</option>
                  {activeTab === "subscribers" ? (
                    <>
                      <option value="email">Sort: Email</option>
                      <option value="status">Sort: Status</option>
                    </>
                  ) : (
                    <>
                      <option value="status">Sort: Status</option>
                      <option value="name">Sort: Name</option>
                    </>
                  )}
                </select>
              </label>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearCurrentFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
                >
                  <XCircle size={15} />
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-h-[420px] p-4 md:p-5">
          {loading ? (
            <LoadingState />
          ) : activeTab === "subscribers" ? (
            filteredSubscribers.length === 0 ? (
              <EmptyState
                icon={<Mail size={26} strokeWidth={2.4} />}
                title="No subscribers found"
                message="Try changing the search keyword or status filter."
              />
            ) : (
              <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                <SubscribersTable subscribers={filteredSubscribers} />
              </div>
            )
          ) : filteredContacts.length === 0 ? (
            <EmptyState
              icon={<MessageSquareText size={26} strokeWidth={2.4} />}
              title="No contact queries found"
              message="Try changing the search keyword or contact status filter."
            />
          ) : (
            <div className="grid gap-4">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-[14px] border border-slate-200 bg-white p-1 shadow-sm transition hover:border-slate-300 hover:bg-slate-50/50"
                >
                  <ContactSubmissionCard
                    contact={contact}
                    draftValue={resolutionDrafts[contact.id] || ""}
                    busy={processingId === contact.id}
                    onDraftChange={(value) =>
                      setResolutionDrafts((prev) => ({
                        ...prev,
                        [contact.id]: value,
                      }))
                    }
                    onMarkSolved={() => onMarkSolved(contact.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}