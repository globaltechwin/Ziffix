"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/layout/Sidebar";
import { Navbar } from "@/components/shared/layout/Navbar";
import { CartProvider } from "@/context/cart-context";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Fixed sidebar — visible on lg+ only */}
        <div className="hidden lg:flex">
          <Sidebar portal="customer" mode="fixed" />
        </div>

        {/* Overlay sidebar — mobile only */}
        <Sidebar
          portal="customer"
          mode="overlay"
          isOpen={overlayOpen}
          onClose={() => setOverlayOpen(false)}
        />

        {overlayOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden"
            onClick={() => setOverlayOpen(false)}
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar portal="customer" onMenuToggle={() => setOverlayOpen(!overlayOpen)} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
