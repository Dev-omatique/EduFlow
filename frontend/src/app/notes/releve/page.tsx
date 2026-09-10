"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import { AlertCircle, FileText, ShieldAlert } from "lucide-react";

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

type SubjectNotes = {
  subject: string;
  notes: NoteBackend[];
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatGrade(note: NoteBackend): string {
  const maxNotes = parseFloat(note.Exam?.maxNotes ?? "20");

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

function ReportCardTable({ notes }: { notes: NoteBackend[] }) {
  const subjects = useMemo<SubjectNotes[]>(() => {
    const groupedNotes = new Map<string, NoteBackend[]>();

    notes.forEach((note) => {
      const subjectName = note.Exam?.Subject?.type || "Matière inconnue";
      const subjectNotes = groupedNotes.get(subjectName) ?? [];

      subjectNotes.push(note);
      groupedNotes.set(subjectName, subjectNotes);
    });

    return Array.from(groupedNotes.entries())
      .map(([subject, subjectNotes]) => ({
        subject,
        notes: subjectNotes.sort(
          (firstNote, secondNote) =>
            new Date(secondNote.createdAt).getTime() -
            new Date(firstNote.createdAt).getTime()
        ),
      }))
      .sort((firstSubject, secondSubject) =>
        firstSubject.subject.localeCompare(secondSubject.subject, "fr")
      );
  }, [notes]);

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />

          <p className="font-medium">Aucune note disponible.</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Les notes de l'élève apparaîtront ici.
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
  const { notes, loading, error } = useNotes(user);

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

        <ReportCardTable notes={notes} />
      </div>
    </PageShell>
  );
}