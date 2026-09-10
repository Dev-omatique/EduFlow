"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, BookOpen, ClipboardList } from "lucide-react";
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

type ExamItem = {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  isGraded: boolean;
  Subject?: { type: string };
  Grade?: { name: string };
};

type User = {
  id: number;
  Role: { role: string };
  Grade?: { id: number; name: string };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchExams(role: string, userId: number, gradeId?: number) {
  if (role === "STUDENT") {
    if (!gradeId) return [];
    const response = await fetch(`${API_BASE_URL}/api/exams/cours/${gradeId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return response.json() as Promise<ExamItem[]>;
  }

  if (role === "TEACHER") {
    const response = await fetch(`${API_BASE_URL}/api/exams/teacher/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return response.json() as Promise<ExamItem[]>;
  }

  return [];
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isUpcoming(exam: ExamItem) {
  if (!exam.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(exam.dueDate) >= today;
}

export default function ExamsWidget() {
  const { user, isLoading } = useAuth();
  const [exams, setExams] = useState<ExamItem[]>([]);
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
        const typedUser = user as User;
        const role = typedUser.Role.role.toUpperCase();
        const gradeId = typedUser.Grade?.id;

        const data = await fetchExams(role, typedUser.id, gradeId);

        const upcoming = data
          .filter(isUpcoming)
          .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
          .slice(0, 5);

        setExams(upcoming);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        setError("Impossible de charger les devoirs.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoading, user]);

  if (isLoading || loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
          <span className="text-sm">Chargement des devoirs...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Devoirs à faire</CardTitle>
        <CardDescription>Vos prochains devoirs et évaluations</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 stroke-1 text-emerald-500 mb-2" />
            <p className="text-sm font-medium">Aucun devoir à venir.</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  {exam.isGraded ? (
                    <ClipboardList className="h-4 w-4" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {exam.Subject?.type || "Matière"}
                    {exam.Grade?.name ? ` — ${exam.Grade.name}` : ""}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {formatDate(exam.dueDate)}
                </p>
                {exam.isGraded && (
                  <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Évaluation
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}