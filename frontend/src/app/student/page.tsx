"use client";

import Sidebar from "@/components/layout/Sidebar";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NotesWidget from "@/components/dashboard/NotesWidget";
import NewsWidget from "@/components/dashboard/NewsWidget";
import AttendanceWidget from "@/components/dashboard/AttendanceWidget";

export default function DashboardPage() {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          {/* Header de bienvenue */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Bonjour 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bienvenue sur votre espace ENT. Voici un aperçu de votre emploi du temps, de vos notes, absences et actualités.
            </p>
          </div>

          {/* Grille principale en 2 colonnes (2/3 - 1/3) sur grand écran */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Colonne principale (Emploi du temps + Notes) */}
            <div className="space-y-6 xl:col-span-2">
              <CalendarWidget />
              <NotesWidget />
            </div>

            {/* Colonne secondaire (Actualités + Assiduité/Absences) */}
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