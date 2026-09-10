"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  FileText,
  Loader2,
  MessageSquare,
  ShieldAlert,
  Users,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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
    maxNotes: string;
    coefficient: number;
    Subject: {
      id: number;
      type: string;
    };
  };
};

type ClassNote = {
  id: number;
  grade: string;
  studentId: number;
  examId: number;
  noteStatusId: number;
  createdAt: string;
};

type ClassStats = {
  average: number;
  min: number;
  max: number;
  count: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SIDEBAR_OFFSET = "lg:pl-[280px]";

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

async function getNotes(
  roleName: string,
  userId: number
): Promise<NoteBackend[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/notes/${roleName}/${userId}`,
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

async function getClassNotes(examId: number): Promise<ClassNote[]> {
  const response = await fetch(`${API_BASE_URL}/api/notes/exam/${examId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Calculs
// ---------------------------------------------------------------------------

function calculateClassStats(classNotes: ClassNote[]): ClassStats {
  const grades = classNotes
    .map((note) => parseFloat(note.grade))
    .filter((grade) => !Number.isNaN(grade));

  if (grades.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  return {
    average: grades.reduce((sum, grade) => sum + grade, 0) / grades.length,
    min: Math.min(...grades),
    max: Math.max(...grades),
    count: grades.length,
  };
}

function getGradeOn20(note: NoteBackend): number {
  const maxNotes = parseFloat(note.Exam?.maxNotes ?? "20") || 20;
  const grade = parseFloat(note.grade) || 0;

  return (grade / maxNotes) * 20;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";

  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useNotes(
  user: { id: number; Role: { role: string } } | null | undefined
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
        const data = await getNotes(roleName, currentUser.id);

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

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    notes,
    loading,
    error,
  };
}

const classNotesCache = new Map<number, Promise<ClassNote[]>>();

function getClassNotesCached(examId: number): Promise<ClassNote[]> {
  if (!classNotesCache.has(examId)) {
    classNotesCache.set(examId, getClassNotes(examId));
  }

  return classNotesCache.get(examId)!;
}

function useExamClassStats(examId: number | null) {
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (examId === null) {
      setStats(null);
      setLoading(false);
      return;
    }

    const currentExamId = examId;
    let cancelled = false;

    async function loadStats() {
      try {
        setLoading(true);

        const classNotes = await getClassNotesCached(currentExamId);
        const calculatedStats = calculateClassStats(classNotes);

        if (!cancelled) {
          setStats(calculatedStats);
        }
      } catch (err) {
        console.error("Erreur statistiques classe :", err);

        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [examId]);

  return {
    stats,
    loading,
  };
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />

            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-20 w-full rounded-lg"
                />
              ))}
            </div>
          </div>

          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    </PageShell>
  );
}

// ---------------------------------------------------------------------------
// Note list item
// ---------------------------------------------------------------------------

function NoteCard({
  note,
  selected,
  onSelect,
}: {
  note: NoteBackend;
  selected: boolean;
  onSelect: () => void;
}) {
  const maxNotes = parseFloat(note.Exam?.maxNotes ?? "20");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left transition ${
        selected ? "rounded-lg ring-2 ring-primary" : ""
      }`}
    >
      <Card className="transition-colors hover:border-primary/60">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {note.grade}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">
                {note.Exam?.title}
              </p>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {note.Exam?.Subject?.type ?? "Matière"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 sm:flex sm:items-center sm:gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Note</p>

              <p className="font-semibold">
                {note.grade}
                <span className="text-xs font-normal text-muted-foreground">
                  /{maxNotes}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Coefficient</p>

              <p className="font-semibold">
                {note.Exam?.coefficient ?? "-"}
              </p>
            </div>

            <div className="sm:min-w-[120px] sm:text-right">
              <p className="text-xs text-muted-foreground">Date</p>

              <p className="text-sm font-medium">
                {formatDate(note.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Détails d'une note
// ---------------------------------------------------------------------------

function NoteDetailPanel({ note }: { note: NoteBackend | null }) {
  const { stats: classStats, loading: statsLoading } = useExamClassStats(
    note?.examId ?? null
  );

  if (!note) {
    return (
      <Card className="flex min-h-[500px] items-center justify-center">
        <div className="px-6 text-center text-muted-foreground">
          <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />

          <p className="text-sm">
            Sélectionnez une note pour voir ses détails.
          </p>
        </div>
      </Card>
    );
  }

  const maxGrade = parseFloat(note.Exam?.maxNotes ?? "20");
  const gradeOn20 = getGradeOn20(note);

  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {note.Exam?.Subject?.type ?? "Matière inconnue"}
        </p>

        <CardTitle className="text-xl">{note.Exam?.title}</CardTitle>

        <CardDescription>
          Évaluation passée le {formatDate(note.createdAt)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg bg-muted p-5 text-center">
          <p className="text-sm text-muted-foreground">Note obtenue</p>

          <p className="mt-1 text-4xl font-bold text-primary">
            {note.grade}
            <span className="text-lg font-normal text-muted-foreground">
              /{maxGrade}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">Coefficient</p>
            </div>

            <p className="mt-2 font-bold">
              {note.Exam?.coefficient ?? "-"}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">Équivalent</p>
            </div>

            <p className="mt-2 font-bold">{gradeOn20.toFixed(2)}/20</p>
          </div>
        </div>

        {note.comment && (
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />

              <p className="text-sm font-semibold">Appréciation</p>
            </div>

            <p className="text-sm text-muted-foreground">{note.comment}</p>
          </div>
        )}

        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />

            <p className="text-sm font-semibold">
              Statistiques de la classe
            </p>
          </div>

          {statsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : classStats ? (
            <>
              <div className="grid grid-cols-3 divide-x text-center">
                <div className="px-2">
                  <p className="text-xs text-muted-foreground">Moyenne</p>

                  <p className="mt-1 font-bold">
                    {classStats.average.toFixed(2)}
                  </p>
                </div>

                <div className="px-2">
                  <p className="text-xs text-muted-foreground">Minimum</p>

                  <p className="mt-1 font-bold text-red-600">
                    {classStats.min.toFixed(2)}
                  </p>
                </div>

                <div className="px-2">
                  <p className="text-xs text-muted-foreground">Maximum</p>

                  <p className="mt-1 font-bold text-emerald-600">
                    {classStats.max.toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Basé sur {classStats.count} copie
                {classStats.count > 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <p className="py-2 text-center text-sm text-muted-foreground">
              Statistiques indisponibles.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Notes() {
  const { user, isLoading: authLoading } = useAuth();
  const { notes, loading, error } = useNotes(user);

  const [selectedNote, setSelectedNote] = useState<NoteBackend | null>(null);

  const recentNotes = useMemo(() => {
    return [...notes].sort(
      (firstNote, secondNote) =>
        new Date(secondNote.createdAt).getTime() -
        new Date(firstNote.createdAt).getTime()
    );
  }, [notes]);

  useEffect(() => {
    if (recentNotes.length === 0) {
      setSelectedNote(null);
      return;
    }

    setSelectedNote((currentSelectedNote) => {
      if (
        currentSelectedNote &&
        recentNotes.some((note) => note.id === currentSelectedNote.id)
      ) {
        return currentSelectedNote;
      }

      return recentNotes[0];
    });
  }, [recentNotes]);

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
              Veuillez vous connecter pour consulter vos notes.
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
          <h1 className="text-2xl font-bold tracking-tight">Mes notes</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Consultez vos évaluations récentes et les statistiques de la classe.
          </p>
        </div>

        {recentNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />

              <p className="font-medium">Aucune note disponible.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Évaluations récentes</CardTitle>

                    <CardDescription>
                      Vos notes, de la plus récente à la plus ancienne.
                    </CardDescription>
                  </div>

                  <Badge variant="secondary" className="shrink-0">
                    {recentNotes.length} note
                    {recentNotes.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {recentNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    selected={selectedNote?.id === note.id}
                    onSelect={() => setSelectedNote(note)}
                  />
                ))}
              </CardContent>
            </Card>

            <NoteDetailPanel note={selectedNote} />
          </div>
        )}
      </div>
    </PageShell>
  );
}