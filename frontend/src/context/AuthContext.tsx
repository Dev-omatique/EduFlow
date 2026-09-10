"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

interface Role {
  id: number;
  role: string;
}

interface Grade {
  id: number;
  name: string;
}

interface PrincipalTeacher {
  id: number;
  gradeId: number;
  Grade?: Grade;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  Role: Role;
  Grade?: Grade;
  PrincipalTeacher?: PrincipalTeacher;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRole: (role: string) => boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export function AuthProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestId = useRef(0);

  const fetchUser = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (currentRequestId === requestId.current) {
          setUser(null);
        }

        return;
      }

      const data: User = await res.json();

      if (currentRequestId === requestId.current) {
        setUser(data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur:", err);

      if (currentRequestId === requestId.current) {
        setUser(null);
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const isRole = useCallback(
    (role: string) => user?.Role?.role === role,
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isRole,
      refetchUser: fetchUser,
      logout,
    }),
    [fetchUser, isLoading, isRole, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
}