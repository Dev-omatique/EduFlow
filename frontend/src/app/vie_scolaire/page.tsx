"use client";

import Sidebar from "@/components/layout/Sidebar";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NewsWidget from "@/components/dashboard/NewsWidget";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <Sidebar />

        <main className="min-h-screen bg-background px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-sm text-muted-foreground">
              Vérification des accès...
            </p>
          </div>
        </main>
      </>
    );
  }

  const userRole = user?.Role?.role?.toLowerCase();

  if (
    !user ||
    (userRole !== "vie_scolaire" && userRole !== "vie scolaire")
  ) {
    return (
      <>
        <Sidebar />

        <main className="min-h-screen bg-background px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6">
          <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center">
            <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
              <h1 className="text-xl font-semibold">
                Accès non autorisé
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Cette page est réservée à la vie scolaire.
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

      <main className="min-h-screen bg-background px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Bonjour 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Bienvenue sur votre espace vie scolaire. Voici un aperçu de
              l&apos;emploi du temps et des dernières actualités.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
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