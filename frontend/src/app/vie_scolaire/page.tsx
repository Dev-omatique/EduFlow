import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/Sidebar";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import NotesWidget from "@/components/dashboard/NotesWidget";
import NewsWidget from "@/components/dashboard/NewsWidget";
import AttendanceWidget from "@/components/dashboard/AttendanceWidget";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Sidebar />

      <main className="w-full px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Bonjour</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Bienvenue sur votre espace ENT. Voici un aperçu de votre emploi du temps, vos notes et les dernières actualités.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
                <CardContent className="p-0">
                  <CalendarWidget />
                </CardContent>
            </div>
            <div className="space-y-6">
              <NewsWidget />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
