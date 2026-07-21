"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface Role {
  id: number;
  role: string;
}

interface Grade {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  Role: Role;
  Grade?: Grade;
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


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchUser() {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data: User = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isRole: (role) => user?.Role?.role === role,
    refetchUser: fetchUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
}