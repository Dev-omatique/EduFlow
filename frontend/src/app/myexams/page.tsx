"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Hourglass,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type UpcomingExam = {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxNotes: string;
  coefficient: number | null;
  isGraded: boolean | null;
  Subject?: { id: number; type: string } | null;
  Grade?: { id: number; name: string } | null;
  AcademicPeriod?: { label: string; schoolYear: string } | null;
};

type ExamGroup = {
  key: string;
  label: string;
  exams: UpcomingExam[];
};

type ExamsUser = {
  id: number;
  Role: { role: string };
  Grade?: { id: number } | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SIDEBAR_OFFSET = "lg:pl-[280px]";
const ALL_SUBJECTS = "all";
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Date du jour au format AAAA-MM-JJ, utilisée comme filtre côté API.
function todayAsQueryParam(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

// Nombre de jours entre aujourd'hui et la date de l'examen (0 = aujourd'hui).
function daysUntil(dueDate: string): number {
  const today = startOfDay(new Date()).getTime();
  const examDay = startOfDay(new Date(dueDate)).getTime();
  return Math.round((examDay - today) / DAY_MS);
}

function formatLongDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatCountdown(days: number): string {
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `Dans ${days} jours`;
}

function getGroupKey(days: number): string {
  if (days === 0) return "today";
  if (days <= 7) return "week";
  if (days <= 31) return "month";
  return "later";
}

const GROUP_LABELS: Record<string, string> = {
  today: "Aujourd'hui",
  week: "Dans les 7 prochains jours",
  month: "Dans le mois",
  later: "Plus tard",
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

// L'élève voit les examens de sa classe, l'enseignant ses propres examens.
// Le filtre startDate est appliqué par l'API (dueDate >= aujourd'hui).
function getExamsUrl(user: ExamsUser): string | null {
  const query = `?startDate=${todayAsQueryParam()}`;
  const role = user.Role.role.toUpperCase();

  if (role === "STUDENT") {
    return user.Grade?.id ? `${API_BASE_URL}/api/exams/cours/${user.Grade.id}${query}` : null;
  }
  if (role === "TEACHER") {
    return `${API_BASE_URL}/api/exams/teacher/${user.id}${query}`;
  }
  return null;
}

async function fetchUpcomingExams(url: string): Promise<UpcomingExam[]> {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

function useUpcomingExams(user: ExamsUser | null | undefined) {
  const [exams, setExams] = useState<UpcomingExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }

      const url = getExamsUrl(user);
      if (!url) {
        setError("Les devoirs à venir sont disponibles pour les élèves et les enseignants.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchUpcomingExams(url);

        if (!cancelled) {
          // Sécurité côté interface : on ne garde que les dates à venir, triées.
          const upcoming = data
            .filter((exam) => exam.dueDate && daysUntil(exam.dueDate) >= 0)
            .sort((first, second) => (first.dueDate ?? "").localeCompare(second.dueDate ?? ""));
          setExams(upcoming);
        }
      } catch (err) {
        console.error("Erreur devoirs à venir :", err);
        if (!cancelled) setError("Impossible de charger les devoirs à venir.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { exams, loading, error };
}

// ---------------------------------------------------------------------------
// Composants
// ---------------------------------------------------------------------------

function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className={`min-h-screen bg-background ${SIDEBAR_OFFSET}`}>
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 py-6">{children}</div>
      </main>
    </>
  );
}

function SummaryCard({ icon, label, value, detail }: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-xl font-bold tracking-tight">{value}</p>
          {detail && <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ExamRow({ exam }: { exam: UpcomingExam }) {
  const days = exam.dueDate ? daysUntil(exam.dueDate) : 0;
  const isUrgent = days <= 2;
  const isGraded = exam.isGraded !== false;

  return (
    <li className="flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{exam.Subject?.type ?? "Matière"}</Badge>
          {!isGraded && <Badge variant="outline">Non noté</Badge>}
        </div>

        <p className="font-semibold">{exam.title}</p>

        {exam.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{exam.description}</p>
        )}

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {exam.dueDate ? formatLongDate(exam.dueDate) : "Date à venir"}
          </span>
          {isGraded && <span>Sur {Number.parseFloat(exam.maxNotes)}</span>}
          {isGraded && <span>Coef. {exam.coefficient ?? 1}</span>}
          {exam.AcademicPeriod && <span>{exam.AcademicPeriod.label}</span>}
        </p>
      </div>

      <span
        className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          isUrgent ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {formatCountdown(days)}
      </span>
    </li>
  );
}

function ExamGroups({ groups }: { groups: ExamGroup[] }) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">Aucun devoir à venir.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les prochains devoirs apparaîtront ici dès qu&apos;ils seront programmés.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label} · {group.exams.length}
          </h2>
          <ul className="space-y-3">
            {group.exams.map((exam) => (
              <ExamRow key={exam.id} exam={exam} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyExamsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { exams, loading, error } = useUpcomingExams(user);
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);

  const subjects = useMemo(
    () =>
      Array.from(new Set(exams.map((exam) => exam.Subject?.type).filter((name): name is string => Boolean(name))))
        .sort((first, second) => first.localeCompare(second, "fr")),
    [exams]
  );

  const filteredExams = useMemo(
    () =>
      selectedSubject === ALL_SUBJECTS
        ? exams
        : exams.filter((exam) => exam.Subject?.type === selectedSubject),
    [exams, selectedSubject]
  );

  const groups = useMemo<ExamGroup[]>(() => {
    const byKey = new Map<string, UpcomingExam[]>();
    filteredExams.forEach((exam) => {
      const key = getGroupKey(exam.dueDate ? daysUntil(exam.dueDate) : 0);
      byKey.set(key, [...(byKey.get(key) ?? []), exam]);
    });

    return ["today", "week", "month", "later"]
      .filter((key) => byKey.has(key))
      .map((key) => ({ key, label: GROUP_LABELS[key], exams: byKey.get(key) ?? [] }));
  }, [filteredExams]);

  const nextExam = filteredExams[0];
  const thisWeekCount = filteredExams.filter(
    (exam) => exam.dueDate && daysUntil(exam.dueDate) <= 7
  ).length;

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
        <Alert variant="destructive" className="mx-auto max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Connexion requise</AlertTitle>
          <AlertDescription>Veuillez vous connecter pour voir vos devoirs à venir.</AlertDescription>
        </Alert>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes devoirs à venir</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tous les devoirs programmés à partir d&apos;aujourd&apos;hui, du plus proche au plus lointain.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={<ClipboardList className="h-5 w-5" />}
              label="Devoirs à venir"
              value={String(filteredExams.length)}
            />
            <SummaryCard
              icon={<Hourglass className="h-5 w-5" />}
              label="Dans les 7 jours"
              value={String(thisWeekCount)}
            />
            <SummaryCard
              icon={<CalendarClock className="h-5 w-5" />}
              label="Prochain devoir"
              value={nextExam?.dueDate ? formatCountdown(daysUntil(nextExam.dueDate)) : "—"}
              detail={nextExam ? `${nextExam.Subject?.type ?? "Matière"} · ${nextExam.title}` : undefined}
            />
          </div>

          {subjects.length > 1 && (
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="exam-subject" className="text-sm font-medium">
                Matière
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="exam-subject" className="w-[min(100%,260px)]">
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SUBJECTS}>Toutes les matières</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <ExamGroups groups={groups} />
        </>
      )}
    </PageShell>
  );
}