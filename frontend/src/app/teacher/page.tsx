"use client";

import Sidebar from "@/components/layout/Sidebar";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NewsWidget from "@/components/dashboard/NewsWidget";

export default function TeacherDashboardPage() {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          {/* Header de bienvenue Enseignant */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Bonjour 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bienvenue sur votre espace enseignant. Voici vos cours prévus aujourd'hui et les dernières actualités de l'établissement.
            </p>
          </div>

          {/* Grille des widgets */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Planning / Cours du professeur */}
            <div className="space-y-6 xl:col-span-2">
              <CalendarWidget />
            </div>

            {/* Actualités de l'établissement */}
            <div className="space-y-6">
              <NewsWidget />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}