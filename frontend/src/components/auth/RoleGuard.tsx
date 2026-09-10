"use client";

import type { ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

type RoleGuardProps = {
  allowedRoles: string[];
  unauthorizedMessage: string;
  mainClassName?: string;
  children: ReactNode;
};

function normalizeRole(role: string): string {
  return role.trim().toLowerCase().replace(/\s+/g, "_");
}

export default function RoleGuard({
  allowedRoles,
  unauthorizedMessage,
  mainClassName = "min-h-screen bg-background p-4 lg:pl-[270px]",
  children,
}: Readonly<RoleGuardProps>) {
  const { user, isLoading } = useAuth();
  const normalizedUserRole = user?.Role?.role
    ? normalizeRole(user.Role.role)
    : null;
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
  const hasAccess =
    normalizedUserRole !== null &&
    normalizedAllowedRoles.includes(normalizedUserRole);

  if (isLoading) {
    return (
      <>
        <Sidebar />
        <main className={mainClassName}>
          <div className="mx-auto w-full max-w-7xl py-6">
            <p className="text-sm text-muted-foreground">
              Vérification des accès...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!user || !hasAccess) {
    return (
      <>
        <Sidebar />
        <main className={mainClassName}>
          <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center py-6">
            <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
              <h1 className="text-xl font-semibold">Accès non autorisé</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {unauthorizedMessage}
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
