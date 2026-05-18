"use client";
import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { usePathname } from "next/navigation";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const disableSmoothScroll = true;

  useEffect(() => {
    if (isAdmin || disableSmoothScroll) return;
  }, [isAdmin, disableSmoothScroll]);

  if (isAdmin) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
