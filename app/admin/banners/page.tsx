"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FileImage,
  ImageIcon,
  Loader2,
  MonitorPlay,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  createAdminBanner,
  deleteAdminBanner,
  fetchAdminBanners,
  type AdminBanner,
  updateAdminBanner,
} from "@/app/lib/apiClient";

type BannerFormState = {
  imageUrl: string;
  order: string;
  isActive: boolean;
  imageFile: File | null;
};

const initialForm: BannerFormState = {
  imageUrl: "",
  order: "0",
  isActive: true,
  imageFile: null,
};

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Live" : "Hidden"}
    </span>
  );
}

function BannerSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[12px] border border-slate-200 bg-white p-3"
        >
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_150px_210px] lg:items-center">
            <div className="h-28 animate-pulse rounded-[10px] bg-slate-100" />

            <div className="grid gap-2">
              <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-10 animate-pulse rounded bg-slate-100 lg:block" />
            <div className="hidden h-10 animate-pulse rounded bg-slate-100 lg:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminBannersPage() {
  const [items, setItems] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<AdminBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBanner | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formPreviewSrc, setFormPreviewSrc] = useState("");
  const [form, setForm] = useState<BannerFormState>(initialForm);

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) || null,
    [items, editingId],
  );

  const activeCount = useMemo(
    () => items.filter((item) => item.isActive !== false).length,
    [items],
  );

  const hiddenCount = Math.max(0, items.length - activeCount);

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [items]);

  useEffect(() => {
    if (!form.imageFile) {
      setFormPreviewSrc(form.imageUrl.trim() || editingItem?.imageUrl || "");
      return;
    }

    const objectUrl = URL.createObjectURL(form.imageFile);
    setFormPreviewSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.imageFile, form.imageUrl, editingItem?.imageUrl]);

  const load = async (mode: "initial" | "refresh" = "initial") => {
    try {
      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);

      setError("");

      const rows = await fetchAdminBanners();
      setItems(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load banners.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!formOpen && !viewItem && !deleteTarget) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (saving || deletingId) return;

      setFormOpen(false);
      setViewItem(null);
      setDeleteTarget(null);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [formOpen, viewItem, deleteTarget, saving, deletingId]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const openCreateModal = () => {
    resetForm();
    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;

    setFormOpen(false);
    resetForm();
  };

  const validateForm = () => {
    if (!form.imageFile && !form.imageUrl.trim() && !editingItem?.imageUrl) {
      return "Banner image is required.";
    }

    return "";
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        imageUrl: form.imageUrl.trim() || undefined,
        order: Number(form.order || 0),
        isActive: form.isActive,
        image: form.imageFile || undefined,
      };

      if (editingId) {
        await updateAdminBanner(editingId, payload);
        setMessage("Banner updated successfully.");
      } else {
        await createAdminBanner(payload);
        setMessage("New banner published.");
      }

      await load();
      setFormOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (item: AdminBanner) => {
    setEditingId(item.id);
    setError("");
    setMessage("");
    setForm({
      imageUrl: item.imageUrl || "",
      order: String(item.order ?? 0),
      isActive: item.isActive !== false,
      imageFile: null,
    });
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletingId) return;

    try {
      setDeletingId(deleteTarget.id);
      setError("");
      setMessage("");

      await deleteAdminBanner(deleteTarget.id);

      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));

      if (editingId === deleteTarget.id) {
        resetForm();
        setFormOpen(false);
      }

      setDeleteTarget(null);
      setViewItem(null);
      setMessage("Banner removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete banner.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 text-slate-900 md:p-6">
      <header className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-600">
                Homepage Content
              </p>
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">
              Banners
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Upload and control homepage banner images from one clean admin workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => load("refresh")}
              disabled={loading || refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.1em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                strokeWidth={2.6}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-4 text-xs font-black uppercase tracking-[0.1em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.8} />
              Add Banner
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500">Total banners</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {items.length}
            </p>
          </div>

          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold text-emerald-700">Live banners</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">
              {activeCount}
            </p>
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">Hidden banners</p>
            <p className="mt-1 text-2xl font-black text-slate-700">
              {hiddenCount}
            </p>
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

      <section className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Banner List
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Clean list view with full image visibility, status, order and quick actions.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-500 ring-1 ring-slate-200">
            <MonitorPlay size={14} strokeWidth={2.6} />
            {loading ? "Loading..." : `${items.length} records`}
          </span>
        </div>

        <div className="hidden border-b border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_150px_210px]">
          <div>Preview</div>
          <div>Image Details</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="p-4 md:p-5">
          {loading ? (
            <BannerSkeleton />
          ) : sortedItems.length === 0 ? (
            <div className="grid place-items-center rounded-[14px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
                <ImageIcon size={26} strokeWidth={2.4} />
              </div>

              <p className="mt-4 text-sm font-black text-slate-700">
                No banners found
              </p>

              <p className="mt-1 max-w-sm text-xs font-medium leading-5 text-slate-400">
                Create your first homepage banner to start showing promotional
                content.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-4 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-slate-800 active:scale-[0.98]"
              >
                <Plus size={16} strokeWidth={2.8} />
                Add Banner
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedItems.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-[14px] border bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-sm ${
                    editingId === item.id
                      ? "border-slate-950 ring-2 ring-slate-950/10"
                      : "border-slate-200"
                  }`}
                >
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_150px_210px] lg:items-center">
                    <button
                      type="button"
                      onClick={() => setViewItem(item)}
                      className="relative h-32 overflow-hidden rounded-[12px] border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px] text-left lg:h-28"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Banner image preview"
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                          No Preview
                        </div>
                      )}

                      {!item.isActive ? (
                        <div className="absolute inset-0 grid place-items-center bg-slate-950/50 backdrop-blur-[1px]">
                          <span className="rounded-full border border-white/30 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            Hidden
                          </span>
                        </div>
                      ) : null}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black tracking-[-0.02em] text-slate-950">
                          Banner Image
                        </h3>

                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                          Order {item.order ?? 0}
                        </span>
                      </div>

                      <p className="mt-2 truncate rounded-[10px] bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                        {item.imageUrl || "No image URL"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:block">
                      <StatusPill active={item.isActive !== false} />

                      <p className="mt-0 text-[10px] font-bold text-slate-400 lg:mt-2">
                        Position {item.order ?? 0}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setViewItem(item)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white active:scale-[0.98]"
                      >
                        <Eye size={14} strokeWidth={2.7} />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => beginEdit(item)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-slate-800 active:scale-[0.98]"
                      >
                        <Edit3 size={14} strokeWidth={2.7} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} strokeWidth={2.7} />
                        )}
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4"
          onMouseDown={closeFormModal}
        >
          <form
            onSubmit={onSubmit}
            onMouseDown={(event) => event.stopPropagation()}
            className="modal-card flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]"
          >
            <div className="shrink-0 flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  {editingId ? "Update banner" : "Create banner"}
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
                  {editingId ? "Edit banner image" : "New banner image"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="grid h-9 w-9 place-items-center rounded-[10px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-950 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={18} strokeWidth={2.6} />
              </button>
            </div>

            <div className="modal-scroll flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-black text-slate-500">
                        External Image URL
                      </span>

                      <input
                        value={form.imageUrl}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            imageUrl: event.target.value,
                          }))
                        }
                        placeholder="https://images.com/banner.jpg"
                        className="h-11 rounded-[12px] border border-slate-300 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-black text-slate-500">
                        Display Order
                      </span>

                      <input
                        type="number"
                        value={form.order}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            order: event.target.value,
                          }))
                        }
                        className="h-11 rounded-[12px] border border-slate-300 bg-white px-4 text-sm font-black text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 self-start">
                    <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px]">
                      <div className="relative aspect-[16/9] w-full">
                        {formPreviewSrc ? (
                          <img
                            src={formPreviewSrc}
                            alt="Banner preview"
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-center">
                            <div>
                              <ImageIcon
                                size={28}
                                className="mx-auto text-slate-400"
                              />
                              <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                                Preview
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-medium leading-5 text-slate-400">
                      Recommended banner ratio: 1600×666 px. Image will fit without cropping.
                    </p>
                  </div>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs font-black text-slate-500">
                    Upload New Asset
                  </span>

                  <div className="relative flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-white">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          imageFile: event.target.files?.[0] || null,
                        }))
                      }
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />

                    <UploadCloud size={24} className="text-slate-400" />

                    <p className="mt-2 text-sm font-black text-slate-700">
                      {form.imageFile
                        ? form.imageFile.name
                        : "Click to upload banner image"}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Image file only · Best size 1600×666 px
                    </p>
                  </div>
                </label>

                <label className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-slate-300 bg-white px-4 transition hover:border-slate-400">
                  <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                    {form.isActive ? (
                      <Eye size={16} strokeWidth={2.5} />
                    ) : (
                      <EyeOff size={16} strokeWidth={2.5} />
                    )}
                    Visible on homepage
                  </span>

                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="sr-only"
                  />

                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      form.isActive ? "bg-slate-950" : "bg-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        form.isActive ? "left-6" : "left-1"
                      }`}
                    />
                  </span>
                </label>
              </div>
            </div>

            <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-[12px] border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  <>
                    <Edit3 size={16} strokeWidth={2.6} />
                    Update Banner
                  </>
                ) : (
                  <>
                    <Plus size={16} strokeWidth={2.8} />
                    Create Banner
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {viewItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4"
          onMouseDown={() => setViewItem(null)}
        >
          <div
            className="modal-card flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Banner Preview
                </p>

                <h2 className="mt-1 truncate text-xl font-black tracking-[-0.03em] text-slate-950">
                  Banner Image
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-950 active:scale-[0.96]"
                aria-label="Close preview"
              >
                <X size={18} strokeWidth={2.6} />
              </button>
            </div>

            <div className="modal-scroll flex-1 overflow-y-auto p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]">
                  <div className="relative flex h-[240px] items-center justify-center sm:h-[320px] lg:h-[440px]">
                    {viewItem.imageUrl ? (
                      <img
                        src={viewItem.imageUrl}
                        alt="Banner image preview"
                        className="max-h-full max-w-full object-contain p-3"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-400">
                        <FileImage size={36} />
                      </div>
                    )}

                    {!viewItem.isActive ? (
                      <div className="absolute inset-0 grid place-items-center bg-slate-950/50 backdrop-blur-[1px]">
                        <span className="rounded-full border border-white/30 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                          Hidden
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <aside className="grid gap-3 self-start">
                  <div className="rounded-[14px] border border-slate-200 bg-white p-4">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Status
                        </span>
                        <StatusPill active={viewItem.isActive !== false} />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Order
                        </span>
                        <span className="text-sm font-black text-slate-950">
                          {viewItem.order ?? 0}
                        </span>
                      </div>

                      <div className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Image URL
                        </span>

                        <p className="break-all rounded-[10px] bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                          {viewItem.imageUrl || "No image URL"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setViewItem(null);
                        beginEdit(viewItem);
                      }}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-slate-800 active:scale-[0.98]"
                    >
                      <Edit3 size={14} strokeWidth={2.7} />
                      Edit
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={() => {
            if (!deletingId) setDeleteTarget(null);
          }}
        >
          <div
            className="modal-card w-full max-w-md rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.25)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={18} strokeWidth={2.6} />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Delete banner?
                </h2>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  This will permanently remove{" "}
                  <b className="text-slate-800">
                    this banner image
                  </b>
                  . This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(deletingId)}
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} strokeWidth={2.6} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .modal-card {
          animation: modalIn 180ms ease-out;
        }

        .modal-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior: contain;
        }

        .modal-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-card,
          .modal-card * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
