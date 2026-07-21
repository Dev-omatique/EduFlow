"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, ShieldCheck, BadgeCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600 border border-red-100">
        <p className="font-medium">Oups !</p>
        <p className="text-sm">Impossible de charger les informations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Mon Profil
        </h1>
        <p className="text-sm text-slate-500">
          Informations de votre compte EduFlow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne Gauche : Carte d'identité */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="h-24 bg-primary w-full" />
          <CardContent className="relative pt-0 flex flex-col items-center">
            <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-sm text-primary">
              <User className="h-12 w-12" />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-slate-800 capitalize">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-slate-500 font-mono">@{user.username}</p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                <BadgeCheck className="h-4 w-4" />
                {user.Role.role}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colonne Droite : Détails techniques */}
        <Card className="lg:col-span-2 border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Détails du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InfoBox icon={Mail} label="Adresse Email" value={user.email} />
              <InfoBox icon={User} label="Nom d'utilisateur" value={user.username} />
              <InfoBox icon={ShieldCheck} label="ID Utilisateur" value={`#${user.id}`} />

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="mt-1 rounded-lg bg-white p-2 shadow-sm">
                  <div className="h-5 w-5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Statut</p>
                  <p className="text-slate-800 font-semibold text-sm">Session active (Cookie sécurisé)</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Petit composant interne pour éviter la répétition
function InfoBox({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="mt-1 rounded-lg bg-white p-2 shadow-sm">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="text-slate-800 font-semibold break-all text-sm">{value}</p>
      </div>
    </div>
  );
}