"use client";
import SymbolIcon from "@/app/components/icons/SymbolIcon";
import React, { useEffect, useState } from "react";
import { useRequireAuth } from "@/app/context/AuthContext";
import {
  createUserAddress,
  fetchUserAddresses,
  updateUserAddress,
  type UserAddress,
  type UserAddressInput,
} from "@/app/lib/apiClient";
import AddressForm from "@/app/components/address/AddressForm";
import AddressModal from "@/app/components/address/AddressModal";
import AddressCard from "@/app/components/address/AddressCard";

import { AddressListSkeleton, Skeleton } from "@/app/components/Skeletons";

export default function ShippingAddressesPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth('/user/auth');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressError, setAddressError] = useState("");
  const [form, setForm] = useState<UserAddressInput>({
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
    setIsDataLoading(true);
    fetchUserAddresses()
      .then((rows) => setAddresses(Array.isArray(rows) ? rows : []))
      .catch(() => setAddresses([]))
      .finally(() => setIsDataLoading(false));
  }, [isAuthenticated]);

  const openCreate = () => {
    setEditingAddressId(null);
    setAddressError("");
    setForm({
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
    setShowAddressForm(true);
  };

  const openEdit = (addr: UserAddress) => {
    setEditingAddressId(addr.address_id);
    setAddressError("");
    setForm({
      FullName: addr.FullName || "",
      phone1: addr.phone1 || "",
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
    if (!form.FullName || !form.phone1 || !form.address || !form.city || !form.pinCode) {
      setAddressError("Please fill required fields.");
      return;
    }
    try {
      setSaving(true);
      setAddressError("");
      if (editingAddressId) {
        const updated = await updateUserAddress(editingAddressId, form);
        setAddresses((prev) => prev.map((a) => (a.address_id === editingAddressId ? updated : a)));
      } else {
        const created = await createUserAddress(form);
        setAddresses((prev) => [created, ...prev]);
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (isAuthenticated && isDataLoading)) {
    return (
      <div className="flex-grow min-h-screen max-w-5xl mx-auto pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-pulse">
           <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-96" />
              <Skeleton className="h-4 w-80" />
           </div>
           <Skeleton className="h-14 w-48 rounded-full" />
        </div>
        <AddressListSkeleton />
      </div>
    );
  }


  if (!isAuthenticated) return null;

  return (
    <div className="flex-grow min-h-screen max-w-5xl mx-auto pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-xl">
          <nav className="flex items-center gap-2 mb-4 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-secondary uppercase">
            <span>Account</span>
            <SymbolIcon name={"chevron_right"} className="text-[10px] sm:text-xs" />
            <span className="text-outline">Addresses</span>
          </nav>
          <h1 className="font-headline text-5xl md:text-6xl text-primary font-medium tracking-tight">Shipping Addresses</h1>
          <p className="mt-4 text-on-surface-variant max-w-md font-medium leading-relaxed font-body">
            Manage your delivery locations for a seamless checkout experience across your heritage subscription.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-secondary text-secondary rounded-full font-bold text-xs md:text-sm tracking-widest uppercase hover:bg-secondary/5 transition-all disabled:opacity-60"
        >
          <SymbolIcon name={"add"} className="text-lg" />
          {saving ? "Adding..." : "Add New Address"}
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <AddressCard
            key={address.address_id}
            address={address}
            selected={false}
            onSelect={() => {}}
            onEdit={() => openEdit(address)}
          />
        ))}
      </div>
      {addresses.length === 0 && (
        <div className="mt-8 rounded-xl border border-outline-variant/30 p-6 text-center text-on-surface-variant">
          No saved addresses found.
        </div>
      )}
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
            value={form}
            onChange={setForm}
            onSubmit={handleAddressSubmit}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddressId(null);
              setAddressError("");
            }}
            submitLabel={editingAddressId ? "Update Address" : "Save Address"}
            busy={saving}
            error={addressError}
          />
        </AddressModal>
      )}

      {/* Decorative Element */}
      <div className="mt-20 opacity-30 pointer-events-none">
        <div className="flex justify-between items-center border-t border-outline-variant/20 pt-8">
          <div className="font-headline italic text-primary">Est. 2021</div>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
            <div className="w-2 h-2 rounded-full bg-secondary opacity-50"></div>
            <div className="w-2 h-2 rounded-full bg-secondary opacity-20"></div>
          </div>
          <div className="font-headline italic text-primary uppercase tracking-widest text-xs">Authentic Origin</div>
        </div>
      </div>
    </div>
  );
}
