"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  CalendarDays,
  BookOpen,
  Users,
  Filter,
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";
import CreateExamModal from "@/components/exam/CreateExamModal";

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExamItem = {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxNotes: string;
  coefficient: number;
  isGraded: boolean;
  Subject?: { type: string };
  Grade?: { name: string };
};

type CurrentUser = {
  id: number;
  Role: { role: string };
  Grade?: { id: number };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SIDEBAR_OFFSET = "lg:pl-[280px]"; // doit rester alignée avec la largeur définie dans Sidebar

// ---------------------------------------------------------------------------
// Appels API
// ---------------------------------------------------------------------------

async function fetchExams(role: string, userId: number, gradeId?: number): Promise<ExamItem[]> {
  if (role === "STUDENT") {
    if (!gradeId) throw new Error("Grade ID indisponible");

    const response = await fetch(`${API_BASE_URL}/api/exams/cours/${gradeId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return response.json();
  }

  if (role === "TEACHER") {
    const response = await fetch(`${API_BASE_URL}/api/exams/teacher/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return response.json();
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

// ---------------------------------------------------------------------------
// Hooks de données
// ---------------------------------------------------------------------------

function useExams(user: CurrentUser | null | undefined) {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const role = user.Role.role.toUpperCase();

    fetchExams(role, user.id, user.Grade?.id)
      .then((data) => {
        if (!cancelled) setExams(data);
      })
      .catch((err) => {
        console.error("Erreur chargement examens :", err);
        if (!cancelled) setError("Impossible de charger les examens.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // reloadToken ne sert qu'à déclencher un nouveau fetch (voir refetch ci-dessous)
  }, [user, reloadToken]);

  const refetch = () => setReloadToken((t) => t + 1);

  return { exams, loading, error, refetch };
}

function useExamFilters(exams: ExamItem[]) {
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const availableGrades = useMemo(() => {
    const names = exams.map((exam) => exam.Grade?.name).filter((n): n is string => Boolean(n));
    return Array.from(new Set(names)).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (!exam.isGraded) return false;

      const matchesGrade = selectedGrade === "all" || exam.Grade?.name === selectedGrade;
      const matchesDate =
        !selectedDate ||
        (exam.dueDate && new Date(exam.dueDate).toISOString().slice(0, 10) === selectedDate);

      return matchesGrade && matchesDate;
    });
  }, [exams, selectedGrade, selectedDate]);

  const hasActiveFilters = selectedGrade !== "all" || selectedDate !== "";

  const resetFilters = () => {
    setSelectedGrade("all");
    setSelectedDate("");
  };

  return {
    selectedGrade,
    setSelectedGrade,
    selectedDate,
    setSelectedDate,
    availableGrades,
    filteredExams,
    hasActiveFilters,
    resetFilters,
  };
}

// ---------------------------------------------------------------------------
// Mise en page commune
// ---------------------------------------------------------------------------

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className={`min-h-screen bg-background ${SIDEBAR_OFFSET}`}>{children}</main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function FiltersBar({
  selectedGrade,
  onGradeChange,
  availableGrades,
  selectedDate,
  onDateChange,
  hasActiveFilters,
  onReset,
}: {
  selectedGrade: string;
  onGradeChange: (value: string) => void;
  availableGrades: string[];
  selectedDate: string;
  onDateChange: (value: string) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b pb-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-1">
        <Filter className="h-4 w-4" />
        Filtres
      </div>

      <Select value={selectedGrade} onValueChange={onGradeChange}>
        <SelectTrigger className="w-[180px] h-9">
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
        onChange={(e) => onDateChange(e.target.value)}
        className="w-auto h-9"
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-primary hover:text-primary/80 h-9">
          Réinitialiser
        </Button>
      )}
    </div>
  );
}

function ExamCard({ exam }: { exam: ExamItem }) {
  return (
    <Link href={`/notes/exams/${exam.id}`} className="group block">
      <Card className="h-full transition-colors hover:border-primary/60">
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
            <span className="shrink-0 text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {exam.isGraded ? `Coeff ${exam.coefficient}` : "Non noté"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {exam.description || "Pas de description"}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(exam.dueDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {exam.Grade?.name || "Classe"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExamListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { exams, loading, error, refetch } = useExams(user);
  const filters = useExamFilters(exams);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isTeacher = user?.Role.role === "TEACHER";

  if (authLoading || loading) {
    return (
      <PageShell>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto my-12 p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connexion requise</AlertTitle>
            <AlertDescription>
              Veuillez vous connecter pour accéder à la liste des examens.
            </AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 py-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-6">
            <div>
              <CardTitle className="text-2xl font-bold">Examens</CardTitle>
              <CardDescription className="mt-1">
                {isTeacher
                  ? "Sélectionnez un contrôle pour ouvrir la feuille de notes."
                  : "Consultez les examens prévus pour votre classe."}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium w-fit">
                <BookOpen className="h-4 w-4 text-primary" />
                {filters.filteredExams.length} examen{filters.filteredExams.length > 1 ? "s" : ""}
              </Badge>

              {isTeacher && (
                <>
                  <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Créer un devoir
                  </Button>

                  <CreateExamModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={refetch}
                    teacherId={user.id}
                  />
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <FiltersBar
              selectedGrade={filters.selectedGrade}
              onGradeChange={filters.setSelectedGrade}
              availableGrades={filters.availableGrades}
              selectedDate={filters.selectedDate}
              onDateChange={filters.setSelectedDate}
              hasActiveFilters={filters.hasActiveFilters}
              onReset={filters.resetFilters}
            />

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filters.filteredExams.length === 0 ? (
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
                {filters.filteredExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}