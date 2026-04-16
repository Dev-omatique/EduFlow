"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  NotebookText,
  CalendarDays,
  User,
  MessageSquare,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Accueil", href: "/dashboard", icon: Home },
  { label: "Notes", href: "/notes", icon: NotebookText },
  { label: "Calendrier", href: "/calendrier", icon: CalendarDays },
  { label: "Profil", href: "/profil", icon: User },
  { label: "Messagerie", href: "/messages", icon: MessageSquare },
];

function SidebarLink({ href, icon: Icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
        active
          ? "bg-white text-primary shadow-sm"
          : "text-white hover:bg-white/15"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          active
            ? "border-primary-light bg-primary-light text-primary"
            : "border-white/20 bg-white/10 text-white"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col bg-primary text-primary-foreground">
      
      {/* HEADER */}
      <div className="border-b border-white/20 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold leading-none">EduFlow</p>
            <p className="text-xs text-white/80">Espace ENT</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* FOOTER */}
      <div className="px-4 pb-5">
        <Button
          className="w-full justify-start gap-3 rounded-2xl border-0 bg-white text-primary hover:bg-primary-light"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}