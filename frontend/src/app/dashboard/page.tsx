import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Bonjour 👋
        </h1>
        <p className="text-sm text-slate-500">
          Bienvenue sur votre espace ENT.
        </p>
      </div>

      {/* Grid dashboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bloc principal */}
        <Card className="rounded-2xl border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Emploi du temps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-slate-50 p-6 text-slate-600">
              Aucun cours affiché pour le moment.
            </div>
          </CardContent>
        </Card>

        {/* Bloc droite */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Prochains devoirs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">
              Mathématiques — lundi
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Histoire — mercredi
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Anglais — vendredi
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Notes récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span>Maths</span>
              <span className="font-semibold text-slate-800">15/20</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span>Français</span>
              <span className="font-semibold text-slate-800">13/20</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">
              Nouveau message du professeur principal.
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Réunion parents-professeurs prévue.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">
              Vacances scolaires dans 2 semaines.
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Inscription cantine ouverte.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}