"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, TrendingUp, TrendingDown, Minus, X, BookOpen, Calendar, Award, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

type NoteBackend = {
  id: number;
  grade: string;
  studentId: number;
  examId: number;
  createdAt: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getNotes(roleName: string, userId: number): Promise<NoteBackend[]> {
  const url = `${API_BASE_URL}/api/notes/${roleName}/${userId}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

  return response.json();
}

async function getClassNotes(examId: number): Promise<ClassNote[]> {
  const url = `${API_BASE_URL}/api/notes/exam/${examId}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

  return response.json();
}

function calculateClassStats(classNotes: ClassNote[]) {
  const grades = classNotes.map((n) => parseFloat(n.grade)).filter((g) => !isNaN(g));

  if (grades.length === 0) {
    return { average: 0, min: 0, max: 0, count: 0 };
  }

  const average = grades.reduce((sum, g) => sum + g, 0) / grades.length;

  return {
    average,
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

function calculateWeightedAverage(notes: NoteBackend[]): number {
  const totalCoef = notes.reduce((sum, n) => sum + (n.Exam?.coefficient ?? 1), 0);

  if (totalCoef === 0) return 0;

  const totalWeighted = notes.reduce((sum, n) => {
    const coef = n.Exam?.coefficient ?? 1;
    return sum + getGradeOn20(n) * coef;
  }, 0);

  return totalWeighted / totalCoef;
}

function calculateAveragesBySubject(notes: NoteBackend[]) {
  const bySubject = new Map<string, NoteBackend[]>();

  for (const note of notes) {
    const subject = note.Exam?.Subject?.type ?? "Autre";
    if (!bySubject.has(subject)) bySubject.set(subject, []);
    bySubject.get(subject)!.push(note);
  }

  return Array.from(bySubject.entries())
    .map(([subject, subjectNotes]) => ({
      subject,
      average: calculateWeightedAverage(subjectNotes),
      count: subjectNotes.length,
    }))
    .sort((a, b) => b.average - a.average);
}

function calculateOverallClassAverage(examStats: { average: number; count: number }[]) {
  const totalCount = examStats.reduce((sum, stat) => sum + stat.count, 0);
  if (totalCount === 0) return 0;
  const totalSum = examStats.reduce((sum, stat) => sum + stat.average * stat.count, 0);
  return totalSum / totalCount;
}

function getAverageStatus(average: number) {
  if (average >= 16) return { label: "Excellent", ring: "#16a34a", bg: "bg-green-50", text: "text-green-700", Icon: TrendingUp };
  if (average >= 14) return { label: "Très bien", ring: "#22c55e", bg: "bg-green-50", text: "text-green-700", Icon: TrendingUp };
  if (average >= 12) return { label: "Bien", ring: "#65a30d", bg: "bg-lime-50", text: "text-lime-700", Icon: TrendingUp };
  if (average >= 10) return { label: "Dans la moyenne", ring: "#d97706", bg: "bg-amber-50", text: "text-amber-700", Icon: Minus };
  if (average >= 8) return { label: "Insuffisant", ring: "#ea580c", bg: "bg-orange-50", text: "text-orange-700", Icon: TrendingDown };
  return { label: "À surveiller", ring: "#dc2626", bg: "bg-red-50", text: "text-red-700", Icon: TrendingDown };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AverageKpiCard({
  average,
  classAverage,
  classAverageLoading,
  studentName,
}: {
  average: number;
  classAverage: number | null;
  classAverageLoading: boolean;
  studentName: string;
}) {
  return (
    <div className="max-w-3xl rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Moyenne élève</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {average.toFixed(1)}<span className="text-base font-medium text-slate-500">/20</span>
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Moyenne de la classe</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {classAverageLoading ? "..." : classAverage !== null ? classAverage.toFixed(1) : "-"}
            <span className="text-base font-medium text-slate-500">/20</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SubjectAveragesList({ notes }: { notes: NoteBackend[] }) {
  const averages = calculateAveragesBySubject(notes);

  if (averages.length === 0) return null;

  return (
    <div className="grid gap-4 lg:max-w-2xl lg:grid-cols-1">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Moyennes par matière
        </p>
        <div className="space-y-3">
          {averages.map(({ subject, average, count }) => (
            <div key={subject} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{count} note{count > 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-slate-900">{average.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">/20</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min((average / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoteDetailModal({ note, onClose }: { note: NoteBackend; onClose: () => void }) {
  const gradeOn20 = getGradeOn20(note);
  const status = getAverageStatus(gradeOn20);

  const [classStats, setClassStats] = useState<{ average: number; min: number; max: number; count: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchClassStats = async () => {
      try {
        const classNotes = await getClassNotes(note.examId);
        if (!cancelled) setClassStats(calculateClassStats(classNotes));
      } catch (err) {
        console.error("Erreur stats classe:", err);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };

    fetchClassStats();
    return () => {
      cancelled = true;
    };
  }, [note.examId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-start justify-between rounded-t-2xl ${status.bg} p-5`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {note.Exam?.Subject?.type ?? "Matière inconnue"}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-800">{note.Exam?.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-black/5"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <span className="text-sm font-medium text-slate-600">Note obtenue</span>
            <span className={`text-2xl font-bold ${status.text}`}>
              {note.grade}/{parseFloat(note.Exam?.maxNotes ?? "20")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-border p-3">
              <Award className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-muted-foreground">Coefficient</p>
                <p className="text-sm font-semibold text-slate-800">{note.Exam?.coefficient}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border p-3">
              <BookOpen className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-muted-foreground">Équivalent /20</p>
                <p className="text-sm font-semibold text-slate-800">{gradeOn20.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-semibold text-slate-800">{formatDate(note.createdAt)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Statistiques de la classe</span>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : classStats ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="text-xs text-muted-foreground">Moyenne</p>
                  <p className="text-sm font-bold text-slate-800">{classStats.average.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-red-50 py-2">
                  <p className="text-xs text-muted-foreground">Min</p>
                  <p className="text-sm font-bold text-red-700">{classStats.min.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-green-50 py-2">
                  <p className="text-xs text-muted-foreground">Max</p>
                  <p className="text-sm font-bold text-green-700">{classStats.max.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-2">
                Statistiques indisponibles.
              </p>
            )}

            {classStats && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Basé sur {classStats.count} copie{classStats.count > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const { user, isLoading: authLoading } = useAuth();
  const [notes, setNotes] = useState<NoteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteBackend | null>(null);
  const [classAverage, setClassAverage] = useState<number | null>(null);
  const [classAverageLoading, setClassAverageLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchNotes = async () => {
      try {
        const roleName = user.Role.role.toLowerCase();
        const data = await getNotes(roleName, user.id);
        setNotes(data);
      } catch (err) {
        console.error("Erreur notes:", err);
        setError("Impossible de charger les notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [authLoading, user]);

  useEffect(() => {
    if (notes.length === 0) {
      setClassAverage(null);
      setClassAverageLoading(false);
      return;
    }

    let cancelled = false;
    setClassAverageLoading(true);

    const fetchClassAverage = async () => {
      try {
        const uniqueExamIds = Array.from(new Set(notes.map((note) => note.examId)));
        const examStats = await Promise.all(
          uniqueExamIds.map(async (examId) => {
            const classNotes = await getClassNotes(examId);
            return calculateClassStats(classNotes);
          })
        );

        if (!cancelled) {
          setClassAverage(calculateOverallClassAverage(examStats));
        }
      } catch (err) {
        console.error("Erreur calcul moyenne de classe:", err);
        if (!cancelled) {
          setClassAverage(null);
        }
      } finally {
        if (!cancelled) {
          setClassAverageLoading(false);
        }
      }
    };

    fetchClassAverage();

    return () => {
      cancelled = true;
    };
  }, [notes]);

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
          <ShieldAlert className="h-10 w-10 mb-3 opacity-90" />
          <h3 className="font-semibold text-lg">Accès refusé</h3>
          <p className="text-sm opacity-80 mt-1">Veuillez vous connecter pour consulter vos notes.</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="rounded-2xl bg-red-50 p-6 text-red-600 border border-red-100 lg:ml-[270px]">
          <p className="font-medium">Oups !</p>
          <p className="text-sm">{error}</p>
        </div>
      </>
    );
  }

  const average = calculateWeightedAverage(notes);
  const studentName = `${user.firstName} ${user.lastName}`;

  return (
    <>
      <Sidebar />
      <div className="p-4 space-y-6 lg:pl-[270px]">
        <div>
          <h1 className="text-2xl font-bold mb-4">Notes</h1>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <AverageKpiCard
              average={average}
              classAverage={classAverage}
              classAverageLoading={classAverageLoading}
              studentName={studentName}
            />
            <SubjectAveragesList notes={notes} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Mes notes</h2>
                <p className="text-sm text-slate-500">Suivi clair de vos dernières notes</p>
              </div>
              <p className="text-sm text-slate-600">{notes.length} note{notes.length > 1 ? "s" : ""}</p>
            </div>

            <div className="lg:hidden">
              {notes.length === 0 ? (
                <div className="rounded-2xl border border-border bg-slate-50 p-6 text-center text-sm text-muted-foreground shadow-sm">
                  Aucune note disponible.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setSelectedNote(note)}
                      className="w-full rounded-3xl border border-border bg-slate-50 p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{note.Exam?.Subject?.type ?? "Matière inconnue"}</p>
                          <p className="mt-1 text-sm text-slate-700">{note.Exam?.title}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                          {formatDate(note.createdAt)}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Note</p>
                          <p className="mt-1 font-semibold text-slate-900">{note.grade}/{parseFloat(note.Exam?.maxNotes ?? "20")}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Coef.</p>
                          <p className="mt-1 font-semibold text-slate-900">{note.Exam?.coefficient}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600">Matière</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600">Contrôle</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600">Note</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600">Coef.</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                          Aucune note disponible.
                        </td>
                      </tr>
                    ) : (
                      notes.map((note) => (
                        <tr
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className="cursor-pointer border-t border-border transition-colors hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">{note.Exam?.Subject?.type ?? "Matière inconnue"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{note.Exam?.title}</td>
                          <td className="px-4 py-3 font-semibold">
                            {note.grade}/{parseFloat(note.Exam?.maxNotes ?? "20")}
                          </td>
                          <td className="px-4 py-3">{note.Exam?.coefficient}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedNote && (
        <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} />
      )}
    </>
  );
}