"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, UserX, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AttendanceBackend = {
  id: number;
  comment?: string;
  attendanceStatusId?: number;
  courseId?: number;
  studentId?: number;
  createdAt?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchAttendancesForStudent(userId: number) {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/api/attendances/student/${userId}`
    : `/api/attendances/student/${userId}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<AttendanceBackend[]>;
}

export default function AttendanceWidget() {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<AttendanceBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await fetchAttendancesForStudent(user.id);

        const absences = data
          .filter(
            (item) =>
              item.attendanceStatusId === 1 || item.attendanceStatusId === 4
          )
          .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
          .slice(0, 5);

        setItems(absences);
      } catch (err) {
        console.error("Failed to fetch attendances:", err);
        setError("Impossible de charger les absences.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoading, user]);

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusBadge(statusId?: number) {
    switch (statusId) {
      case 1:
        return <Badge variant="destructive">Injustifiée</Badge>;
      case 4:
        return <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">Justifiée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  }

  function getStatusIcon(statusId?: number) {
    if (statusId === 4) {
      // Justifiée : Pastille aux couleurs du thème primaire avec icône UserCheck
      return (
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <UserCheck className="h-4 w-4" />
        </div>
      );
    }

    // Injustifiée (1) ou autre : Pastille rouge avec icône UserX
    return (
      <div className="rounded-full bg-destructive/10 p-2 text-destructive">
        <UserX className="h-4 w-4" />
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
          <span className="text-sm">Chargement des absences...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Absences récentes</CardTitle>
        <CardDescription>Vos 5 dernières absences signalées</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 stroke-1 text-emerald-500 mb-2" />
            <p className="text-sm font-medium">Aucune absence récente.</p>
          </div>
        ) : (
          items.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {/* Icône et pastille dynamique selon le statut */}
                {getStatusIcon(a.attendanceStatusId)}

                <div>
                  <p className="text-sm font-semibold">Absence</p>
                  <p className="text-xs text-muted-foreground">
                    {a.comment || "Aucun motif renseigné"}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {formatDate(a.createdAt)}
                </p>
                <div>{getStatusBadge(a.attendanceStatusId)}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}