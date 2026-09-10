"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, BookOpen, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExamDetail = {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxNotes: string;
  coefficient: number;
  Subject?: { type: string };
  Grade?: { id: number; name: string };
};

type Student = { id: number; firstName: string; lastName: string };

type NotePayload = { studentId: number; examId: number; grade: string };

type ExistingNote = { id: number; grade: string; studentId: number; examId: number };

type SubmitState = { status: "idle" | "saving" | "success" | "error"; message?: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const SIDEBAR_OFFSET = "lg:pl-[280px]"; // doit rester alignée avec la largeur définie dans Sidebar

// ---------------------------------------------------------------------------
// Appels API
// ---------------------------------------------------------------------------

async function fetchExam(examId: string): Promise<ExamDetail> {
  const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

async function fetchStudents(examId: string): Promise<Student[]> {
  const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/students`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

async function fetchExamNotes(examId: string): Promise<ExistingNote[]> {
  const response = await fetch(`${API_BASE_URL}/api/notes/exam/${examId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

async function saveNote(note: NotePayload) {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

async function updateNote(noteId: number, note: NotePayload) {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
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

function useExam(examId: string, enabled: boolean) {
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchExam(examId)
      .then((data) => {
        if (!cancelled) setExam(data);
      })
      .catch((err) => {
        console.error("Erreur chargement examen :", err);
        if (!cancelled) setError("Impossible de charger les informations de l'examen.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examId, enabled]);

  return { exam, loading, error };
}

function useExamRoster(examId: string, enabled: boolean) {
  const [students, setStudents] = useState<Student[]>([]);
  const [notesByStudent, setNotesByStudent] = useState<Record<number, ExistingNote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchStudents(examId), fetchExamNotes(examId)])
      .then(([studentsData, notesData]) => {
        if (cancelled) return;

        setStudents(studentsData);

        const notesMap: Record<number, ExistingNote> = {};
        notesData.forEach((note) => {
          notesMap[note.studentId] = note;
        });
        setNotesByStudent(notesMap);
      })
      .catch((err) => {
        console.error("Erreur chargement élèves/notes :", err);
        if (!cancelled) setError("Impossible de charger la liste des élèves ou des notes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examId, enabled, reloadToken]);

  const reload = () => setReloadToken((t) => t + 1);

  return { students, notesByStudent, loading, error, reload };
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

function ExamSummaryCard({
  exam,
  classAverage,
  studentCount,
  gradedCount,
  onBack,
}: {
  exam: ExamDetail;
  classAverage: number | null;
  studentCount: number;
  gradedCount: number;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux examens
        </Button>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {exam.Subject?.type || "Matière"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{exam.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {exam.description || "Aucune description fournie."}
            </p>

            <div className="mt-6 grid grid-cols-3 divide-x divide-border border-t pt-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Date du contrôle</p>
                <p className="mt-1 text-base font-semibold text-foreground">{formatDate(exam.dueDate)}</p>
              </div>
              <div className="pl-4">
                <p className="text-xs font-medium text-muted-foreground">Coefficient</p>
                <p className="mt-1 text-base font-semibold text-foreground">{exam.coefficient}</p>
              </div>
              <div className="pl-4">
                <p className="text-xs font-medium text-muted-foreground">Moyenne de classe</p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {classAverage !== null ? `${classAverage.toFixed(2)} / ${exam.maxNotes}` : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-5">
            <p className="text-xs font-medium text-muted-foreground">Classe</p>
            <p className="mt-1 text-base font-semibold text-foreground">{exam.Grade?.name || "Non renseignée"}</p>

            <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {studentCount} étudiant{studentCount > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {gradedCount} note{gradedCount > 1 ? "s" : ""} saisie{gradedCount > 1 ? "s" : ""}
                {studentCount > 0 ? ` sur ${studentCount}` : ""}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentsGradingCard({
  students,
  grades,
  onGradeChange,
  maxNotes,
  canEdit,
  onSave,
  isSaving,
  loading,
  error,
  submitState,
}: {
  students: Student[];
  grades: Record<number, string>;
  onGradeChange: (studentId: number, value: string) => void;
  maxNotes: string;
  canEdit: boolean;
  onSave: () => void;
  isSaving: boolean;
  loading: boolean;
  error: string | null;
  submitState: SubmitState;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
        <div>
          <CardTitle className="text-xl font-bold">Liste des élèves</CardTitle>
          <CardDescription className="mt-1">
            {canEdit ? "Saisissez une note pour chaque élève." : "Affichage des élèves pour ce contrôle."}
          </CardDescription>
        </div>

        {canEdit && (
          <Button onClick={onSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Enregistrer les notes
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-muted-foreground">Élève</th>
                  <th className="px-4 py-3 text-sm font-semibold text-muted-foreground">Note</th>
                  <th className="px-4 py-3 text-sm font-semibold text-muted-foreground">Maximum</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        max={maxNotes}
                        value={grades[student.id] ?? ""}
                        disabled={!canEdit}
                        onChange={(e) => onGradeChange(student.id, e.target.value)}
                        placeholder="0"
                        className="max-w-[120px]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{maxNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {submitState.status === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        )}

        {submitState.status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const canEdit = user?.Role.role === "TEACHER";

  const { exam, loading: examLoading, error: examError } = useExam(examId, !authLoading && Boolean(user));
  const roster = useExamRoster(examId, canEdit && Boolean(exam));

  const [grades, setGrades] = useState<Record<number, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  // Resynchronise le formulaire à chaque (re)chargement des notes existantes.
  useEffect(() => {
    const initial: Record<number, string> = {};
    Object.entries(roster.notesByStudent).forEach(([studentId, note]) => {
      initial[Number(studentId)] = note.grade;
    });
    setGrades(initial);
  }, [roster.notesByStudent]);

  const classAverage = (() => {
    const numericGrades = Object.values(roster.notesByStudent)
      .map((note) => Number.parseFloat(note.grade))
      .filter((value) => !Number.isNaN(value));

    if (numericGrades.length === 0) return null;
    return numericGrades.reduce((total, value) => total + value, 0) / numericGrades.length;
  })();

  const gradedCount = Object.keys(roster.notesByStudent).length;

  const handleGradeChange = (studentId: number, value: string) => {
    setGrades((current) => ({ ...current, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!exam) return;

    const payloads = roster.students
      .filter((student) => grades[student.id] !== undefined && grades[student.id] !== "")
      .map((student) => ({
        note: { studentId: student.id, examId: exam.id, grade: grades[student.id] } as NotePayload,
        noteId: roster.notesByStudent[student.id]?.id,
      }));

    if (payloads.length === 0) {
      setSubmitState({ status: "error", message: "Aucune note à enregistrer." });
      return;
    }

    setSubmitState({ status: "saving" });

    try {
      await Promise.all(payloads.map(({ note, noteId }) => (noteId ? updateNote(noteId, note) : saveNote(note))));
      roster.reload();
      setSubmitState({ status: "success", message: "Notes enregistrées avec succès." });
    } catch (err: any) {
      setSubmitState({ status: "error", message: err.message || "Échec lors de l'enregistrement." });
    }
  };

  if (authLoading || examLoading) {
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
            <AlertDescription>Veuillez vous connecter pour voir les détails de l'examen.</AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  if (examError) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto my-12 p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{examError}</AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  if (!exam) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto my-12 p-8">
          <Alert>
            <AlertTitle>Examen non trouvé</AlertTitle>
          </Alert>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 py-6">
        <ExamSummaryCard
          exam={exam}
          classAverage={classAverage}
          studentCount={roster.students.length}
          gradedCount={gradedCount}
          onBack={() => router.back()}
        />

        <StudentsGradingCard
          students={roster.students}
          grades={grades}
          onGradeChange={handleGradeChange}
          maxNotes={exam.maxNotes}
          canEdit={canEdit}
          onSave={handleSave}
          isSaving={submitState.status === "saving"}
          loading={roster.loading}
          error={roster.error}
          submitState={submitState}
        />
      </div>
    </PageShell>
  );
}