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
  { label: "Accueil", href: "/", icon: Home },
  { label: "Notes", href: "/notes", icon: NotebookText },
  { label: "Calendrier", href: "/calendrier", icon: CalendarDays },
  { label: "Profil", href: "/profil", icon: User },
  { label: "Messagerie", href: "/messages", icon: MessageSquare },
];

type SidebarLinkProps = {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
};

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
        active
          ? "bg-white text-sky-600 shadow-sm"
          : "text-white/95 hover:bg-white/15 hover:text-white"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          active
            ? "border-sky-100 bg-sky-50 text-sky-600"
            : "border-white/20 bg-white/10 text-white"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span>{label}</span>
    </Link>
  );
}

type SidebarProps = {
  onLinkClick?: () => void;
};

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[250px] flex-col bg-sky-500 text-white">
      <div className="border-b border-white/20 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-sm">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold leading-none">EduFlow</p>
            <p className="text-xs text-white/80">Espace ENT</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
            onClick={onLinkClick}
          />
        ))}
      </nav>

      <div className="px-4 pb-5">
        <Button
          variant="secondary"
          className="w-full justify-start gap-3 rounded-2xl border-0 bg-white text-sky-600 hover:bg-sky-50"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}