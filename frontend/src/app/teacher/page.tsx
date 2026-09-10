"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NewsWidget from "@/components/dashboard/NewsWidget";

export default function TeacherDashboardPage() {
  return (
    <RoleGuard
      allowedRoles={["teacher"]}
      unauthorizedMessage="Cette page est réservée aux enseignants."
    >
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
    </RoleGuard>
  );
}
