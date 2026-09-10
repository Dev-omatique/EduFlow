"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";

export type SidebarSubItem = {
  id: number;
  nom: string;
  navigation: string | null;
  icon: string | null;
  ordre: number;
};

export type SidebarItem = {
  id: number;
  nom: string;
  navigation: string | null;
  icon: string | null;
  ordre: number;
  subInfo: SidebarSubItem[];
};

type SidebarContextValue = {
  items: SidebarItem[];
  isLoading: boolean;
  error: string | null;
  refetchSidebar: () => Promise<void>;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function SidebarProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const loadedUserId = useRef<number | null>(null);

  const fetchSidebar = useCallback(async () => {
    if (!user) {
      loadedUserId.current = null;
      setItems([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/sidebar`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de la sidebar");
      }

      const data: SidebarItem[] = await response.json();

      if (currentRequestId === requestId.current) {
        setItems(data);
      }
    } catch (fetchError) {
      console.error("Erreur sidebar :", fetchError);

      if (currentRequestId === requestId.current) {
        setItems([]);
        setError("Impossible de charger le menu.");
        loadedUserId.current = null;
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || loadedUserId.current === user.id) {
      return;
    }

    loadedUserId.current = user.id;
    void fetchSidebar();
  }, [authLoading, fetchSidebar, user]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      items,
      isLoading: authLoading || isLoading,
      error,
      refetchSidebar: fetchSidebar,
    }),
    [authLoading, error, fetchSidebar, isLoading, items]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (context === undefined) {
    throw new Error(
      "useSidebar doit être utilisé à l'intérieur d'un <SidebarProvider>"
    );
  }

  return context;
}
