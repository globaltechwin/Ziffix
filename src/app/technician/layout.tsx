"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shared/layout/Sidebar";
import { Navbar } from "@/components/shared/layout/Navbar";

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/technician/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <Sidebar portal="technician" mode="fixed" />
      </div>

      <Sidebar
        portal="technician"
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
        <Navbar portal="technician" onMenuToggle={() => setOverlayOpen(!overlayOpen)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
