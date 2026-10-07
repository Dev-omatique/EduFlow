"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Loader2,
  Mail,
  User,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <Alert variant="destructive">
        <AlertTitle>Oups !</AlertTitle>
        <AlertDescription>Impossible de charger les informations.</AlertDescription>
      </Alert>
    );
  }

  const roleName = user.Role.role.toLowerCase();
  const isStudent = roleName === "student";
  const isTeacher = roleName === "teacher";
  let associatedClass: string | undefined;

  if (isStudent) {
    associatedClass = user.Grade?.name;
  } else if (isTeacher) {
    associatedClass = user.PrincipalTeacher?.Grade?.name;
  }
  const classLabel = isTeacher ? "Classe principale" : "Classe";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Mon profil
        </h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez les informations de votre compte EduFlow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne Gauche : Carte d'identité */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-primary w-full" />
          <CardContent className="relative pt-0 flex flex-col items-center">
            <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-muted shadow-sm text-primary">
              <User className="h-12 w-12" />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-foreground capitalize">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">@{user.username}</p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold capitalize text-primary">
                <BadgeCheck className="h-4 w-4" />
                {user.Role.role}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colonne Droite : Détails techniques */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InfoBox icon={Mail} label="Adresse Email" value={user.email} />
              <InfoBox icon={User} label="Nom d'utilisateur" value={user.username} />

                <InfoBox
                  icon={GraduationCap}
                  label="Rôle"
                  value={user.Role.role}
                />

                {(isStudent || isTeacher) && (
                  <InfoBox
                    icon={BookOpen}
                    label={classLabel}
                    value={associatedClass ?? "Aucune classe associée"}
                  />
                )}

              <div className="flex items-start gap-4 rounded-xl border bg-muted/50 p-4">
                <div className="mt-1 rounded-lg bg-card p-2 shadow-sm">
                  <div className="h-5 w-5 rounded-full bg-success animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Statut</p>
                  <p className="text-foreground font-semibold text-sm">Session active (Cookie sécurisé)</p>
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
function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-muted/50 p-4">
      <div className="mt-1 rounded-lg bg-card p-2 shadow-sm">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
        <p className="text-card-foreground font-semibold break-all text-sm">{value}</p>
      </div>
    </div>
  );
}