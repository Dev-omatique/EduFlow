"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, CalendarDays, BookOpen, Users, Filter, AlertCircle, FileText } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExamItem = {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxNotes: string;
  coefficient: number;
  Subject?: { type: string };
  Grade?: { name: string };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchExams(role: string, userId: number, gradeId?: number) {
  if (role === "STUDENT") {
    if (!gradeId) {
      throw new Error("Grade ID indisponible");
    }
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

  throw new Error("Rôle non pris en charge pour l'affichage des examens.");
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ExamListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const role = user.Role.role.toUpperCase();
    const gradeId = user.Grade?.id;

    fetchExams(role, user.id, gradeId)
      .then((data) => setExams(data))
      .catch((err) => {
        console.error("Erreur chargement examens:", err);
        setError("Impossible de charger les examens.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  const availableGrades = useMemo(() => {
    const names = exams
      .map((exam) => exam.Grade?.name)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names)).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesGrade =
        selectedGrade === "all" || exam.Grade?.name === selectedGrade;

      const matchesDate =
        !selectedDate ||
        (exam.dueDate &&
          new Date(exam.dueDate).toISOString().slice(0, 10) === selectedDate);

      return matchesGrade && matchesDate;
    });
  }, [exams, selectedGrade, selectedDate]);

  const hasActiveFilters = selectedGrade !== "all" || selectedDate !== "";

  const resetFilters = () => {
    setSelectedGrade("all");
    setSelectedDate("");
  };

  if (authLoading || loading) {
    return (
      <>
        <Sidebar />
        <div className="flex h-[60vh] items-center justify-center lg:pl-[270px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Sidebar />
        <div className="p-8 lg:ml-[270px] max-w-md mx-auto my-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connexion requise</AlertTitle>
            <AlertDescription>
              Veuillez vous connecter pour accéder à la liste des examens.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-6">
              <div>
                <CardTitle className="text-2xl font-bold">Examens</CardTitle>
                <CardDescription className="mt-1">
                  {user.Role.role === "TEACHER"
                    ? "Sélectionnez un contrôle pour ouvrir la feuille de notes."
                    : "Consultez les examens prévus pour votre classe."}
                </CardDescription>
              </div>

              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium w-fit">
                <BookOpen className="h-4 w-4 text-primary" />
                {filteredExams.length} examen{filteredExams.length > 1 ? "s" : ""}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Barre de filtres */}
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                </div>

                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-[180px] h-9 bg-background">
                    <SelectValue placeholder="Toutes les classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {availableGrades.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto h-9 bg-background"
                />

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-primary hover:text-primary/80 h-9"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>

              {/* Affichage des examens ou messages */}
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : filteredExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 stroke-1 mb-3 text-muted-foreground/60" />
                  <p className="text-sm font-medium">
                    {exams.length === 0
                      ? "Aucun examen à afficher pour le moment."
                      : "Aucun examen ne correspond à ces filtres."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredExams.map((exam) => (
                    <Link
                      key={exam.id}
                      href={`/notes/exams/${exam.id}`}
                      className="group block"
                    >
                      <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md">
                        <CardHeader className="space-y-3 pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {exam.Subject?.type || "Matière"}
                              </p>
                              <CardTitle className="mt-1 text-lg font-bold group-hover:text-primary transition-colors">
                                {exam.title}
                              </CardTitle>
                            </div>
                            <Badge variant="secondary" className="shrink-0 font-semibold bg-primary/10 text-primary border-none">
                              Coeff {exam.coefficient}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                            {exam.description || "Pas de description"}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                            <Badge variant="outline" className="gap-1.5 font-normal">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(exam.dueDate)}
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 font-normal">
                              <Users className="h-3.5 w-3.5" />
                              {exam.Grade?.name || "Classe"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}