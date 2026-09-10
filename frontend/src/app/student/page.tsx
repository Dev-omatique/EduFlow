"use client";

import Sidebar from "@/components/layout/Sidebar";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NotesWidget from "@/components/dashboard/NotesWidget";
import ExamsWidget from "@/components/dashboard/Examswidget";
import NewsWidget from "@/components/dashboard/NewsWidget";
import AttendanceWidget from "@/components/dashboard/AttendanceWidget";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
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

  if (!user || userRole !== "student") {
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
                Cette page est réservée aux élèves.
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
              Bienvenue sur votre espace ENT. Voici un aperçu de votre emploi
              du temps, de vos notes, absences et actualités.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <CalendarWidget />
              <NotesWidget />
              <ExamsWidget />
            </div>

            <div className="space-y-6">
              <NewsWidget />
              <AttendanceWidget />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}