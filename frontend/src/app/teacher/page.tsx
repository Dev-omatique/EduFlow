"use client";

import Sidebar from "@/components/layout/Sidebar";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NewsWidget from "@/components/dashboard/NewsWidget";
import { useAuth } from "@/context/AuthContext";

export default function TeacherDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <Sidebar />

        <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
          <div className="mx-auto w-full max-w-7xl py-6">
            <p className="text-sm text-muted-foreground">
              Vérification des accès...
            </p>
          </div>
        </main>
      </>
    );
  }

  const userRole = user?.Role?.role?.toLowerCase();

  if (!user || userRole !== "teacher") {
    return (
      <>
        <Sidebar />

        <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
          <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center py-6">
            <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
              <h1 className="text-xl font-semibold">
                Accès non autorisé
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Cette page est réservée aux enseignants.
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

      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Bonjour 👋
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Bienvenue sur votre espace enseignant. Voici vos cours prévus
              aujourd&apos;hui et les dernières actualités de l&apos;établissement.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <CalendarWidget />
            </div>

            <div className="space-y-6">
              <NewsWidget />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}