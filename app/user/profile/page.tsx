"use client";
import SymbolIcon from "@/app/components/icons/SymbolIcon";
import React, { useEffect, useState } from "react";
import { useAuth, useRequireAuth } from "@/app/context/AuthContext";
import {
  fetchUserProfile,
  updateUserProfile,
  fetchUserAddresses,
  createUserAddress,
  updateUserAddress,
} from "@/app/lib/apiClient";
import type { UserAddress, UserAddressInput } from "@/app/lib/apiClient";
import AddressForm from "@/app/components/address/AddressForm";
import AddressModal from "@/app/components/address/AddressModal";
import AddressCard from "@/app/components/address/AddressCard";

import { ProfileSkeleton } from "@/app/components/Skeletons";

export default function ProfilePage() {
  const { user } = useAuth();
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth("/user/auth");
  const [profile, setProfile] = useState({ name: "", email: user?.email || "", phone: "", gender: "" });
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [addressForm, setAddressForm] = useState<UserAddressInput>({
    FullName: "",
    phone1: "",
    phone2: "",
    country: "India",
    state: "",
    city: "",
    district: "",
    pinCode: "",
    address: "",
    address_line2: "",
    addressType: "Home",
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const [profileData, addressesData] = await Promise.all([
          fetchUserProfile(),
          fetchUserAddresses(),
        ]);
        const raw = profileData as Record<string, unknown>;
        const profileRecord = ((raw.profile as Record<string, unknown>) || raw) as { name?: string; email?: string; phone?: string; gender?: string };
        setProfile({
          name: profileRecord.name || "",
          email: profileRecord.email || user?.email || "",
          phone: profileRecord.phone || "",
          gender: profileRecord.gender || "",
        });
        setAddresses(addressesData);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, user?.email]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const normalizePhone = (value: string) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
    if (digits.startsWith("0") && digits.length > 10) digits = digits.slice(1);
    return digits.slice(0, 10);
  };

  const openCreateAddress = () => {
    setEditingAddressId(null);
    setAddressError("");
    setAddressForm({
      FullName: profile.name || "",
      phone1: profile.phone || "",
      phone2: "",
      country: "India",
      state: "",
      city: "",
      district: "",
      pinCode: "",
      address: "",
      address_line2: "",
      addressType: "Home",
    });
    setShowAddressForm(true);
  };

  const openEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.address_id);
    setAddressError("");
    setAddressForm({
      FullName: addr.FullName || profile.name || "",
      phone1: addr.phone1 || profile.phone || "",
      phone2: addr.phone2 || "",
      country: addr.country || "India",
      state: addr.state || "",
      city: addr.city || "",
      district: addr.district || "",
      pinCode: addr.pinCode || "",
      address: addr.address || "",
      address_line2: addr.address_line2 || "",
      addressType: addr.addressType || "Home",
    });
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async () => {
    if (!addressForm.FullName || !addressForm.phone1 || !addressForm.address || !addressForm.city || !addressForm.pinCode) {
      setAddressError("Please fill required address fields.");
      return;
    }
    try {
      setIsAddressSaving(true);
      setAddressError("");
      if (editingAddressId) {
        const updated = await updateUserAddress(editingAddressId, addressForm);
        setAddresses((prev) => prev.map((addr) => (addr.address_id === editingAddressId ? updated : addr)));
      } else {
        const created = await createUserAddress(addressForm);
        setAddresses((prev) => [created, ...prev]);
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch {
      setAddressError("Failed to save address.");
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handleSave = async () => {
    if (profile.name.trim().length < 2) {
      setProfileError("Please enter a valid full name.");
      return;
    }
    if (profile.phone && !/^\d{10}$/.test(normalizePhone(profile.phone))) {
      setProfileError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    setProfileError("");
    try {
      await updateUserProfile({
        name: profile.name,
        phone: normalizePhone(profile.phone),
        gender: profile.gender,
      });
      setSaveSuccess(true);
      // Refresh profile data
      const raw = await fetchUserProfile() as Record<string, unknown>;
      const profileRecord = ((raw.profile as Record<string, unknown>) || raw) as { name?: string; email?: string; phone?: string; gender?: string };
      setProfile({
        name: profileRecord.name || "",
        email: profileRecord.email || user?.email || "",
        phone: profileRecord.phone || "",
        gender: profileRecord.gender || "",
      });
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) return <ProfileSkeleton />;
  if (!isAuthenticated) return null;


  return (
    <div className="space-y-8 md:space-y-10">
      {/* Personal Information Section */}
      <section className="relative overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,236,0.95))] p-5 shadow-[0_18px_55px_rgba(29,66,26,0.06)] md:p-10">
        <div className="relative z-10">
          <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-primary italic leading-tight md:text-3xl">Account Details</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Manage your core identity and contact information.</p>
            </div>
            <div className="flex items-center gap-4">
              {saveSuccess && (
                <span className="text-secondary text-sm font-medium flex items-center gap-1">
                  <SymbolIcon name={"check_circle"} className="text-sm" />
                  Saved!
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-on-primary transition-all hover:bg-primary-container disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {profileError ? (
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {profileError}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2 md:gap-y-8">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Full Name</label>
              <div className="rounded-2xl border border-outline-variant/20 bg-white/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-primary">
                <input
                  className="w-full bg-transparent border-none p-0 text-base text-primary outline-none focus:ring-0"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Email Address</label>
              <div className="rounded-2xl border border-outline-variant/20 bg-[#f8f6ef] px-4 py-3 transition-colors">
                <input
                  className="w-full bg-transparent border-none p-0 text-base text-primary outline-none focus:ring-0"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Mobile Phone</label>
              <div className="rounded-2xl border border-outline-variant/20 bg-white/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-primary">
                <input
                  className="w-full bg-transparent border-none p-0 text-base text-primary outline-none focus:ring-0"
                  type="tel"
                  value={profile.phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => setProfile({ ...profile, phone: normalizePhone(e.target.value) })}
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Gender</label>
              <div className="rounded-2xl border border-outline-variant/20 bg-white/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-primary">
                <select
                  className="w-full cursor-pointer appearance-none bg-transparent border-none p-0 text-base text-primary outline-none focus:ring-0"
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: String(e.target.value) })}
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>
            {/* Age removed per request */}
          </div>
        </div>
      </section>

      {/* Shipping Addresses Section */}
      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-headline text-2xl font-bold text-primary italic md:text-3xl">Saved Addresses</h2>
          <button
            type="button"
            onClick={openCreateAddress}
            className="flex items-center gap-2 rounded-full border-[1.5px] border-secondary px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-secondary transition-all hover:bg-secondary-container/10"
          >
            <SymbolIcon name={"add"} className="text-[16px]" /> Add New
          </button>
        </div>

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="rounded-[1.75rem] border border-outline-variant/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,244,236,0.92))] py-12 text-center shadow-[0_14px_40px_rgba(29,66,26,0.05)]">
              <SymbolIcon name={"location_off"} className="text-4xl text-outline-variant mb-4" />
              <p className="text-on-surface-variant">No saved addresses yet.</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <AddressCard
                key={addr.address_id}
                address={addr}
                selected={false}
                onSelect={() => {}}
                onEdit={() => openEditAddress(addr)}
              />
            ))
          )}
        </div>
      </section>

      {showAddressForm && (
        <AddressModal
          title={editingAddressId ? "Edit Address" : "Add New Address"}
          onClose={() => {
            setShowAddressForm(false);
            setEditingAddressId(null);
            setAddressError("");
          }}
        >
            <AddressForm
              value={addressForm}
              onChange={setAddressForm}
              onSubmit={handleAddressSubmit}
              onCancel={() => {
                setShowAddressForm(false);
                setEditingAddressId(null);
                setAddressError("");
              }}
              submitLabel={editingAddressId ? "Update Address" : "Save Address"}
              busy={isAddressSaving}
              error={addressError}
            />
        </AddressModal>
      )}

      {/* Heritage Callout */}
      <section className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[2rem] bg-primary text-on-primary">
        <div className="md:col-span-1 h-44 md:h-full relative overflow-hidden bg-primary-container">
          <img
            alt="Artisan Texture"
            className="w-full h-full object-cover brightness-75 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNN_2lgdoWZlKZNGi_kTDHbXlBIwAWSLXAseJD1dygBnS_yJzyK7Cj6e-_Ic5TM6RrzZXXtMylfIbDLum3oO5bFxhhZx-gZ48zTrY1UyJ3VhJI0I7CoDvBFf0w6uemywyXbuCE86JLs5ZJqvg6buu07di-YIXg8-n34HxETSDXFvwXjDoo8RdVYQVKIX1rJIBsm_MF3Or3cVUig_3Zx1szzVU0MLvekz6tG_tlJue8TH5QblVo7_gUDCXaoDjBBEOLm6nVyc0iSxA"
          />
        </div>
        <div className="md:col-span-2 p-10 relative">
          <div className="absolute top-4 right-12 w-20 h-20 md:w-24 md:h-24 rounded-full bg-secondary flex items-center justify-center text-center p-4 border-4 border-primary z-20 shadow-lg rotate-12">
            <span className="font-headline italic text-xs md:text-sm font-bold leading-tight text-white uppercase">100% Traceable</span>
          </div>
          <h3 className="font-headline text-3xl italic mb-4 max-w-sm">Your Gold Standard Protection</h3>
          <p className="font-body text-on-primary/80 text-sm leading-relaxed max-w-md mb-8">
            At Amila Gold, we prioritize the purity of your data as much as the purity of our harvest. Your personal details are stored using state-of-the-art encryption protocols.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-secondary-container">
              <SymbolIcon name={"verified_user"} className="text-[20px]" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-primary">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-container">
              <SymbolIcon name={"history_edu"} className="text-[20px]" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-primary">Privacy Guaranteed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
