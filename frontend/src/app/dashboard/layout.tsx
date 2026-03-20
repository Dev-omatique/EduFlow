"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-[250px] shrink-0">
            <Sidebar onLinkClick={() => setOpen(false)} />
          </div>

          <button
            type="button"
            aria-label="Fermer le menu"
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-4 md:hidden">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6 text-slate-700" />
          </button>

          <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>

          <div className="w-6" />
        </div>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}