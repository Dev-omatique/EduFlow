"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, GraduationCap, Award, Calendar } from "lucide-react";
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

type NoteBackend = {
  id: number;
  grade: string;
  examId: number;
  createdAt: string;
  Exam?: {
    title: string;
    maxNotes: string;
    coefficient: number;
    Subject?: { type: string };
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchNotes(roleName: string, userId: number) {
  const url = `${API_BASE_URL}/api/notes/${roleName}/${userId}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<NoteBackend[]>;
}

function formatNoteDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NotesWidget() {
  const { user, isLoading } = useAuth();
  const [notes, setNotes] = useState<NoteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const roleName = user.Role.role.toLowerCase();

    fetchNotes(roleName, user.id)
      .then((data) => setNotes(data.slice(0, 5)))
      .catch((err) => {
        console.error("Failed to fetch notes:", err);
        setError("Impossible de charger les notes.");
      })
      .finally(() => setLoading(false));
  }, [isLoading, user]);

  if (loading || isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
          <span className="text-sm">Chargement des notes...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connexion requise</AlertTitle>
        <AlertDescription>
          Connectez-vous pour voir vos notes récentes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Notes récentes</CardTitle>
            <CardDescription className="mt-1">
              Vos 5 dernières évaluations
            </CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Award className="h-8 w-8 stroke-1 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">Aucune note disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => {
              const gradeVal = parseFloat(note.grade);
              const maxVal = note.Exam?.maxNotes ? parseFloat(note.Exam.maxNotes) : 20;

              return (
                <div
                  key={note.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {note.Exam?.Subject?.type || "Matière"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {note.Exam?.title || "Évaluation"}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatNoteDate(note.createdAt)}
                      </span>
                      <span>•</span>
                      <span>Coef. {note.Exam?.coefficient ?? 1}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="secondary" className="px-3 py-1 text-sm font-bold">
                      {gradeVal.toFixed(1)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        /{maxVal}
                      </span>
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}