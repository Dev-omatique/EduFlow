"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

function getRolePath(role?: string): string | null {
  const normalizedRole = role?.trim().toLowerCase();

  if (!normalizedRole) {
    return null;
  }

  if (normalizedRole === "vie scolaire") {
    return "/vie_scolaire";
  }

  return `/${normalizedRole}`;
}

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const rolePath = getRolePath(user?.Role?.role);

    router.replace(rolePath ?? "/auth/login");
  }, [isLoading, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Préparation de votre espace...
        </p>
      </div>
    </main>
  );
}