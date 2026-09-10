"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NewsWidget from "@/components/dashboard/NewsWidget";

export default function DashboardPage() {
  return (
    <RoleGuard
      allowedRoles={["vie_scolaire"]}
      unauthorizedMessage="Cette page est réservée à la vie scolaire."
      mainClassName="min-h-screen bg-background px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6"
    >
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
    </RoleGuard>
  );
}
