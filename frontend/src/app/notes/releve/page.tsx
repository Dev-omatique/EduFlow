"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import { AlertCircle, FileText, ShieldAlert, Users, User, ListChecks } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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

type NoteBackend = {
  id: number;
  grade: string;
  studentId: number;
  examId: number;
  createdAt: string;
  comment?: string | null;
  Exam: {
    id: number;
    title: string;
    dueDate?: string | null;
    maxNotes: string;
    coefficient: number | null;
    isGraded?: boolean | null;
    Subject: {
      id: number;
      type: string;
    };
    AcademicPeriod?: {
      id: number;
      label: string;
      periodType: "TRIMESTER" | "SEMESTER";
      number: number;
      schoolYear: string;
    } | null;
  };
};

type SubjectNotes = {
  subject: string;
  notes: NoteBackend[];
  studentAverage: number | null;
  classAverage: number | null;
};

// Statistiques agrégées d'un examen, calculées par l'API (aucune note individuelle).
type ClassStats = {
  average: number;
  min: number;
  max: number;
  count: number;
};

type Report = {
  subjects: SubjectNotes[];
  studentAverage: number | null;
  classAverage: number | null;
  countedNotes: number;
};

type AcademicPeriod = {
  id: number;
  label: string;
  periodType: "TRIMESTER" | "SEMESTER";
  number: number;
  schoolYear: string;
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SIDEBAR_OFFSET = "lg:pl-[280px]";

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

async function getNotes(
  roleName: string,
  userId: number,
  selectedPeriod: string,
): Promise<NoteBackend[]> {
  const query = selectedPeriod === "all"
    ? ""
    : `?academicPeriodId=${encodeURIComponent(selectedPeriod)}`;
  const response = await fetch(
    `${API_BASE_URL}/api/notes/${roleName}/${userId}${query}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return response.json();
}

async function getAcademicPeriods(): Promise<AcademicPeriod[]> {
  const response = await fetch(`${API_BASE_URL}/api/academic-periods/mine`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

async function getExamClassStats(examId: number): Promise<ClassStats> {
  const response = await fetch(`${API_BASE_URL}/api/notes/exam/${examId}/stats`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

// ---------------------------------------------------------------------------
// Calcul des moyennes
// ---------------------------------------------------------------------------
//
// Règles :
// - toutes les notes sont ramenées sur 20 (note / barème × 20) ;
// - la moyenne d'une matière est pondérée par le coefficient de chaque examen ;
// - la moyenne générale est la moyenne des moyennes par matière ;
// - les examens non notés (isGraded à false, barème nul) ou de coefficient 0
//   ne sont pas pris en compte ;
// - la moyenne de classe d'une matière utilise la moyenne de classe de chaque
//   examen, fournie par l'API sous forme agrégée, avec les mêmes coefficients.

const GRADE_SCALE = 20;

type WeightedValue = { value: number; weight: number };

function getMaxNotes(note: NoteBackend): number {
  return Number.parseFloat(note.Exam?.maxNotes ?? "");
}

function getCoefficient(note: NoteBackend): number {
  const coefficient = note.Exam?.coefficient;
  // Un examen sans coefficient renseigné compte pour 1.
  if (coefficient === null || coefficient === undefined) return 1;
  return Number(coefficient);
}

function isCountedNote(note: NoteBackend): boolean {
  const maxNotes = getMaxNotes(note);
  const grade = Number.parseFloat(note.grade);
  const coefficient = getCoefficient(note);

  return (
    note.Exam?.isGraded !== false &&
    Number.isFinite(maxNotes) &&
    maxNotes > 0 &&
    Number.isFinite(grade) &&
    Number.isFinite(coefficient) &&
    coefficient > 0
  );
}

function toScale(value: number, maxNotes: number): number {
  return (value / maxNotes) * GRADE_SCALE;
}

function weightedAverage(values: WeightedValue[]): number | null {
  const totalWeight = values.reduce((total, item) => total + item.weight, 0);
  if (totalWeight <= 0) return null;

  return values.reduce((total, item) => total + item.value * item.weight, 0) / totalWeight;
}

function mean(values: Array<number | null>): number | null {
  const numbers = values.filter((value): value is number => value !== null);
  if (numbers.length === 0) return null;

  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function buildReport(
  notes: NoteBackend[],
  classStats: Record<number, ClassStats | null>,
): Report {
  const groupedNotes = new Map<string, NoteBackend[]>();

  notes.forEach((note) => {
    const subjectName = note.Exam?.Subject?.type || "Matière inconnue";
    const subjectNotes = groupedNotes.get(subjectName) ?? [];

    subjectNotes.push(note);
    groupedNotes.set(subjectName, subjectNotes);
  });

  const subjects = Array.from(groupedNotes.entries())
    .map(([subject, subjectNotes]) => {
      const countedNotes = subjectNotes.filter(isCountedNote);

      const studentAverage = weightedAverage(
        countedNotes.map((note) => ({
          value: toScale(Number.parseFloat(note.grade), getMaxNotes(note)),
          weight: getCoefficient(note),
        }))
      );

      const classAverage = weightedAverage(
        countedNotes.flatMap((note) => {
          const stats = classStats[note.examId];
          if (!stats || stats.count === 0) return [];

          return [{
            value: toScale(Number(stats.average), getMaxNotes(note)),
            weight: getCoefficient(note),
          }];
        })
      );

      return {
        subject,
        notes: [...subjectNotes].sort(
          (firstNote, secondNote) =>
            new Date(secondNote.createdAt).getTime() -
            new Date(firstNote.createdAt).getTime()
        ),
        studentAverage,
        classAverage,
      };
    })
    .sort((firstSubject, secondSubject) =>
      firstSubject.subject.localeCompare(secondSubject.subject, "fr")
    );

  return {
    subjects,
    studentAverage: mean(subjects.map((subject) => subject.studentAverage)),
    classAverage: mean(subjects.map((subject) => subject.classAverage)),
    countedNotes: notes.filter(isCountedNote).length,
  };
}

function formatAverage(value: number | null): string {
  if (value === null) return "—";

  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}/20`;
}

function formatGap(studentAverage: number | null, classAverage: number | null): string | null {
  if (studentAverage === null || classAverage === null) return null;

  const gap = studentAverage - classAverage;
  const formatted = Math.abs(gap).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (Math.abs(gap) < 0.005) return "Égale à la moyenne de la classe";
  return `${gap > 0 ? "+" : "−"}${formatted} pt par rapport à la classe`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatGrade(note: NoteBackend): string {
  const maxNotes = Number.parseFloat(note.Exam?.maxNotes ?? "20");

  return `${note.grade}/${maxNotes}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";

  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useNotes(
  user: { id: number; Role: { role: string } } | null | undefined,
  selectedPeriod: string,
) {
  const [notes, setNotes] = useState<NoteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadNotes() {
      try {
        setLoading(true);
        setError(null);

        const roleName = currentUser.Role.role.toLowerCase();
        const data = await getNotes(roleName, currentUser.id, selectedPeriod);

        if (!cancelled) {
          setNotes(data);
        }
      } catch (err) {
        console.error("Erreur notes :", err);

        if (!cancelled) {
          setError("Impossible de charger les notes.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [user, selectedPeriod]);

  return {
    notes,
    loading,
    error,
  };
}

// Charge, en parallèle, les statistiques agrégées de chaque examen noté de l'élève.
// Une statistique indisponible n'empêche pas l'affichage : elle est ignorée.
function useClassStats(notes: NoteBackend[]) {
  const [classStats, setClassStats] = useState<Record<number, ClassStats | null>>({});
  const [loading, setLoading] = useState(false);

  const examIdsKey = useMemo(
    () =>
      Array.from(new Set(notes.filter(isCountedNote).map((note) => note.examId)))
        .sort((firstId, secondId) => firstId - secondId)
        .join(","),
    [notes]
  );

  useEffect(() => {
    const examIds = examIdsKey ? examIdsKey.split(",").map(Number) : [];
    let cancelled = false;

    async function loadClassStats() {
      if (examIds.length === 0) {
        setClassStats({});
        setLoading(false);
        return;
      }

      setLoading(true);

      const results = await Promise.allSettled(
        examIds.map((examId) => getExamClassStats(examId))
      );

      if (cancelled) return;

      const statsByExam: Record<number, ClassStats | null> = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          statsByExam[examIds[index]] = result.value;
        } else {
          console.error("Erreur statistiques de classe :", result.reason);
          statsByExam[examIds[index]] = null;
        }
      });

      setClassStats(statsByExam);
      setLoading(false);
    }

    void loadClassStats();

    return () => {
      cancelled = true;
    };
  }, [examIdsKey]);

  return { classStats, loading };
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />

      <main className={`min-h-screen bg-background ${SIDEBAR_OFFSET}`}>
        {children}
      </main>
    </>
  );
}

function NotesPageSkeleton() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 py-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    </PageShell>
  );
}

// ---------------------------------------------------------------------------
// Relevé de notes
// ---------------------------------------------------------------------------

function AverageCard({
  title,
  value,
  detail,
  icon,
  loading = false,
}: {
  title: string;
  value: string;
  detail: string | null;
  icon: ReactNode;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">{icon}</div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>

          {loading ? (
            <Skeleton className="mt-1 h-8 w-24" />
          ) : (
            <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
          )}

          {detail && (
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AverageSummary({
  report,
  periodLabel,
  classLoading,
}: {
  report: Report;
  periodLabel: string;
  classLoading: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AverageCard
        title="Ma moyenne générale"
        value={formatAverage(report.studentAverage)}
        detail={
          classLoading
            ? periodLabel
            : formatGap(report.studentAverage, report.classAverage) ?? periodLabel
        }
        icon={<User className="h-5 w-5" />}
      />

      <AverageCard
        title="Moyenne de la classe"
        value={formatAverage(report.classAverage)}
        detail={periodLabel}
        icon={<Users className="h-5 w-5" />}
        loading={classLoading}
      />

      <AverageCard
        title="Notes prises en compte"
        value={String(report.countedNotes)}
        detail={`${report.subjects.length} matière${report.subjects.length > 1 ? "s" : ""}`}
        icon={<ListChecks className="h-5 w-5" />}
      />
    </div>
  );
}

function ReportCardTable({
  notes,
  subjects,
  classLoading,
}: {
  notes: NoteBackend[];
  subjects: SubjectNotes[];
  classLoading: boolean;
}) {
  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />

          <p className="font-medium">Aucune note disponible.</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Les notes de l&apos;élève apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Relevé de notes</CardTitle>

        <CardDescription>
          Retrouvez toutes vos notes classées par matière.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-y bg-muted/50">
                <th className="w-[220px] border-r px-6 py-4 text-left text-sm font-semibold">
                  Matière
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Notes
                </th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((subject) => (
                <tr
                  key={subject.subject}
                  className="border-b last:border-b-0 hover:bg-muted/30"
                >
                  <td className="border-r px-6 py-5 align-top">
                    <p className="font-semibold">{subject.subject}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {subject.notes.length} note
                      {subject.notes.length > 1 ? "s" : ""}
                    </p>

                    <div className="mt-3 space-y-1 text-sm">
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="text-muted-foreground">Ma moyenne</span>
                        <span className="font-semibold text-primary">
                          {formatAverage(subject.studentAverage)}
                        </span>
                      </p>

                      <p className="flex items-baseline justify-between gap-3">
                        <span className="text-muted-foreground">Classe</span>
                        {classLoading ? (
                          <Skeleton className="h-4 w-14" />
                        ) : (
                          <span className="font-medium">
                            {formatAverage(subject.classAverage)}
                          </span>
                        )}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-3">
                      {subject.notes.map((note) => (
                        <div
                          key={note.id}
                          className="group rounded-lg border bg-background px-4 py-3 shadow-sm transition-colors hover:border-primary/60"
                          title={`${note.Exam?.title} — ${formatDate(
                            note.createdAt
                          )}`}
                        >
                          <p className="font-semibold text-primary">
                            {formatGrade(note)}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs text-muted-foreground">
                            {note.Exam?.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t bg-muted/20 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            {notes.length} note{notes.length > 1 ? "s" : ""} au total dans{" "}
            {subjects.length} matière{subjects.length > 1 ? "s" : ""}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyNotesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState("all");
  const { notes, loading, error } = useNotes(user, selectedTerm);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [periodsError, setPeriodsError] = useState<string | null>(null);
  const { classStats, loading: classLoading } = useClassStats(notes);

  const report = useMemo(() => buildReport(notes, classStats), [notes, classStats]);

  const periodLabel = useMemo(() => {
    if (selectedTerm === "all") return "Toutes les périodes";

    const period = academicPeriods.find((term) => String(term.id) === selectedTerm);
    return period ? `${period.label} · ${period.schoolYear}` : "Période sélectionnée";
  }, [academicPeriods, selectedTerm]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getAcademicPeriods()
      .then((periods) => {
        if (!cancelled) setAcademicPeriods(periods);
      })
      .catch((periodError: unknown) => {
        console.error("Erreur périodes scolaires :", periodError);
        if (!cancelled) setPeriodsError("Impossible de charger les périodes scolaires.");
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || loading) {
    return <NotesPageSkeleton />;
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto my-12 max-w-md p-8">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />

            <AlertTitle>Accès refusé</AlertTitle>

            <AlertDescription>
              Veuillez vous connecter pour consulter le relevé de notes.
            </AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="mx-auto my-12 max-w-md p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />

            <AlertTitle>Erreur</AlertTitle>

            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mon relevé de notes
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Consultez vos notes regroupées par matière.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="report-term" className="text-sm font-medium">
            Période
          </label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger id="report-term" className="w-[min(100%,280px)]">
              <SelectValue placeholder="Toutes les périodes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les périodes</SelectItem>
              {academicPeriods.map((term) => (
                <SelectItem key={term.id} value={String(term.id)}>
                  {term.label} · {term.schoolYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {periodsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{periodsError}</AlertDescription>
          </Alert>
        )}

        {report.subjects.length > 0 && (
          <AverageSummary
            report={report}
            periodLabel={periodLabel}
            classLoading={classLoading}
          />
        )}

        <ReportCardTable
          notes={notes}
          subjects={report.subjects}
          classLoading={classLoading}
        />
      </div>
    </PageShell>
  );
}