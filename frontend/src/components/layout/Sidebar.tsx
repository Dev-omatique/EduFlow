"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  NotebookText,
  CalendarDays,
  User,
  MessageSquare,
  LogOut,
  GraduationCap,
  Menu,
  X,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Users,
  Settings,
  Newspaper,
  PenLine,
  FileBadge,
  TrendingUp,
  Clock,
  BarChart3,
  PlusCircle,
  AlertTriangle,
  NotebookPen,
  UserCog,
  Shield,
  KeyRound,
  BookMarked,
  DoorOpen,
  ScrollText,
  ChevronDown,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type SidebarSubItem = {
  id: number;
  nom: string;
  navigation: string | null;
  icon: string | null;
  ordre: number;
};

type SidebarItem = {
  id: number;
  nom: string;
  navigation: string | null;
  icon: string | null;
  ordre: number;
  subInfo: SidebarSubItem[];
};

const iconMap: Record<string, LucideIcon> = {
  Home,
  NotebookText,
  CalendarDays,
  User,
  MessageSquare,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Users,
  Settings,
  Newspaper,
  PenLine,
  FileBadge,
  TrendingUp,
  Clock,
  BarChart3,
  PlusCircle,
  AlertTriangle,
  NotebookPen,
  UserCog,
  Shield,
  KeyRound,
  BookMarked,
  DoorOpen,
  ScrollText,
};

function getIcon(iconName?: string | null) {
  if (!iconName) return NotebookText;
  return iconMap[iconName] || NotebookText;
}

function isItemActive(pathname: string, item: SidebarItem | SidebarSubItem) {
  if (!item.navigation) return false;

  return (
    pathname === item.navigation || pathname.startsWith(`${item.navigation}/`)
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  isSubItem = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
        isSubItem ? "px-3 py-2 ml-6" : "px-4 py-3",
        active
          ? "bg-white text-primary shadow-sm"
          : "text-white hover:bg-white/15"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border transition-colors",
          isSubItem ? "h-7 w-7" : "h-9 w-9",
          active
            ? "border-primary-light bg-primary-light text-primary"
            : "border-white/20 bg-white/10 text-white"
        )}
      >
        <Icon className={cn(isSubItem ? "h-4 w-4" : "h-5 w-5")} />
      </div>

      <span className={cn(isSubItem && "text-xs")}>{label}</span>
    </Link>
  );
}

function SidebarGroup({
  item,
  pathname,
  onLinkClick,
}: {
  item: SidebarItem;
  pathname: string;
  onLinkClick?: () => void;
}) {
  const [open, setOpen] = useState(() => {
    return item.subInfo?.some((subItem) => isItemActive(pathname, subItem));
  });

  const Icon = getIcon(item.icon);
  const hasChildren = item.subInfo && item.subInfo.length > 0;

  const active =
    isItemActive(pathname, item) ||
    item.subInfo?.some((subItem) => isItemActive(pathname, subItem));

  if (!hasChildren) {
    return (
      <SidebarLink
        href={item.navigation || "#"}
        icon={Icon}
        label={item.nom}
        active={active}
        onClick={onLinkClick}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
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

        <span className="flex-1 text-left">{item.nom}</span>

        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {item.subInfo.map((subItem) => {
            const SubIcon = getIcon(subItem.icon);

            if (!subItem.navigation) return null;

            return (
              <SidebarLink
                key={subItem.id}
                href={subItem.navigation}
                icon={SubIcon}
                label={subItem.nom}
                active={isItemActive(pathname, subItem)}
                onClick={onLinkClick}
                isSubItem
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const [items, setItems] = useState<SidebarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("eduflow_sidebar_cache");

      await logout();

      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Erreur déconnexion :", error);

      localStorage.removeItem("eduflow_sidebar_cache");
      router.push("/auth/login");
      router.refresh();
    }
  };

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sidebar`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la sidebar");
        }

        const data: SidebarItem[] = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Erreur sidebar :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebar();
  }, []);

  return (
    <aside className="flex h-screen w-[250px] flex-col bg-primary text-primary-foreground">
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

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {loading ? (
          <p className="px-4 text-sm text-white/70">Chargement...</p>
        ) : items.length === 0 ? (
          <p className="px-4 text-sm text-white/70">Aucun menu disponible</p>
        ) : (
          items.map((item) => (
            <SidebarGroup
              key={item.id}
              item={item}
              pathname={pathname}
              onLinkClick={onLinkClick}
            />
          ))
        )}
      </nav>

      <div className="px-4 pb-5">
        <Button
          onClick={handleLogout}
          className="w-full justify-start gap-3 rounded-2xl border-0 bg-white text-primary hover:bg-primary-light"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl border bg-white p-2 shadow-md lg:hidden"
      >
        <Menu className="h-6 w-6 text-primary" />
      </button>

      <div className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] lg:block">
        <SidebarContent />
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[250px] transform transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onLinkClick={() => setOpen(false)} />

        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-lg bg-white p-1 shadow"
        >
          <X className="h-5 w-5 text-primary" />
        </button>
      </div>
    </>
  );
}