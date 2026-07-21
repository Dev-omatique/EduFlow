"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, BookOpen, Pencil, CheckCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

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

type Student = {
  id: number;
  firstName: string;
  lastName: string;
};

type NotePayload = {
  studentId: number;
  examId: number;
  grade: string;
};

type ExistingNote = {
  id: number;
  grade: string;
  studentId: number;
  examId: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchExamNotes(examId: string) {
  const response = await fetch(`${API_BASE_URL}/api/notes/exam/${examId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<ExistingNote[]>;
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

async function fetchExam(examId: string) {
  const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<ExamDetail>;
}

async function fetchStudents(examId: string) {
  const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/students`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<Student[]>;
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

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitState, setSubmitState] = useState<{ status: 'idle' | 'saving' | 'success' | 'error'; message?: string }>({ status: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const url = window.location.pathname;
  const examId = url.substring(url.lastIndexOf('/') + 1);
  const [existingNotesByStudent, setExistingNotesByStudent] = useState<Record<number, ExistingNote>>({});

  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const examData = await fetchExam(examId);
        setExam(examData);
      } catch (err) {
        console.error("Erreur chargement exam:", err);
        setError("Impossible de charger les informations de l'examen.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, params.id]);

  const canEdit = useMemo(() => user?.Role.role === "TEACHER", [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canEdit || !exam) {
      setStudentsLoading(false);
      return;
    }

    const fetchStudentsData = async () => {
      setStudentsError(null);
      setStudentsLoading(true);

      try {
        const [studentsData, notesData] = await Promise.all([
          fetchStudents(examId),
          fetchExamNotes(examId),
        ]);

        setStudents(studentsData);

        const notesMap: Record<number, ExistingNote> = {};
        const initialGrades: Record<number, string> = {};

        notesData.forEach((note) => {
          notesMap[note.studentId] = note;
          initialGrades[note.studentId] = note.grade;
        });

        setExistingNotesByStudent(notesMap);
        setGrades(initialGrades);
      } catch (err: any) {
        console.error("Erreur chargement étudiants ou notes:", err);
        setStudentsError("Impossible de charger la liste des élèves ou des notes.");
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudentsData();
  }, [authLoading, canEdit, exam, examId, user]);

  const handleGradeChange = (studentId: number, value: string) => {
    setGrades((current) => ({ ...current, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!exam) return;

    setSubmitState({ status: 'saving' });
    setError(null);

    try {
      const payloads = students
        .filter((student) => grades[student.id] !== undefined && grades[student.id] !== "")
        .map((student) => {
          const note: NotePayload = {
            studentId: student.id,
            examId: exam.id,
            grade: grades[student.id],
          };
          return {
            note,
            noteId: existingNotesByStudent[student.id]?.id,
          };
        });

      if (payloads.length === 0) {
        setSubmitState({ status: 'error', message: 'Aucune note à enregistrer.' });
        return;
      }

      await Promise.all(
        payloads.map(({ note, noteId }) =>
          noteId ? updateNote(noteId, note) : saveNote(note)
        )
      );

      const savedNotes = await fetchExamNotes(examId);
      const notesMap: Record<number, ExistingNote> = {};
      const refreshedGrades: Record<number, string> = {};

      savedNotes.forEach((note) => {
        notesMap[note.studentId] = note;
        refreshedGrades[note.studentId] = note.grade;
      });

      setExistingNotesByStudent(notesMap);
      setGrades(refreshedGrades);
      setSubmitState({ status: 'success', message: 'Notes enregistrées avec succès.' });
    } catch (err: any) {
      setSubmitState({ status: 'error', message: err.message || 'Échec lors de l’enregistrement.' });
    }
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
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive max-w-md mx-auto my-12 lg:ml-[270px]">
          <p className="font-semibold text-lg">Connexion requise</p>
          <p className="mt-2 text-sm opacity-80">Veuillez vous connecter pour voir les détails de l'examen.</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 lg:ml-[270px]">
          {error}
        </div>
      </>
    );
  }

  if (!exam) {
    return (
      <>
        <Sidebar />
        <div className="rounded-2xl border border-border bg-white p-6 text-slate-700 lg:ml-[270px]">
          Examen non trouvé.
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" /> Retour aux examens
            </button>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {exam.Subject?.type || "Matière"}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-slate-900">{exam.title}</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{exam.description || "Aucune description fournie."}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Date du contrôle</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{formatDate(exam.dueDate)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Coefficient</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{exam.coefficient}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Classe</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{exam.Grade?.name || "Non renseignée"}</p>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <p>{students.length} étudiant{students.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <p>Notes saisies manuellement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Liste des élèves</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {canEdit ? "Saisissez une note pour chaque élève." : "Affichage des élèves pour ce contrôle."}
                </p>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  <CheckCircle className="h-4 w-4" /> Enregistrer les notes
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Élève</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Note</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Maximum</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const gradeValue = grades[student.id] ?? "";
                    return (
                      <tr key={student.id} className="border-t border-border">
                        <td className="px-4 py-4 text-sm text-slate-900">{student.firstName} {student.lastName}</td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            max={exam.maxNotes}
                            value={gradeValue}
                            disabled={!canEdit}
                            onChange={(event) => handleGradeChange(student.id, event.target.value)}
                            className="w-full rounded-2xl border border-border bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{exam.maxNotes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {submitState.status === 'success' && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{submitState.message}</span>
                </div>
              </div>
            )}

            {submitState.status === 'error' && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitState.message}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
