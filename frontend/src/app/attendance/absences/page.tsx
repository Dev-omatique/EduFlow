"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import TodayAbsencesWidget from "@/components/dashboard/TodayAbsencesWidget";

export default function AbsenceTrackingPage() {
  return (
    <RoleGuard
      allowedRoles={["vie_scolaire"]}
      unauthorizedMessage="Cette page est réservée à la vie scolaire."
      mainClassName="min-h-screen bg-background px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6"
    >
      <main className="min-h-screen bg-background px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Suivi des absences</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Consultez les élèves signalés absents sur la période choisie.
            </p>
          </header>
          <TodayAbsencesWidget showFilters />
        </div>
      </main>
    </RoleGuard>
  );
}