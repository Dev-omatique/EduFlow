"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  ShieldAlert,
  BookOpen,
  Calendar,
  Award,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

// Composants shadcn/ui
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const grades = classNotes
    .map((n) => parseFloat(n.grade))
    .filter((g) => !isNaN(g));

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
  const totalCoef = notes.reduce(
    (sum, n) => sum + (n.Exam?.coefficient ?? 1),
    0
  );

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

function calculateOverallClassAverage(
  examStats: { average: number; count: number }[]
) {
  const totalCount = examStats.reduce((sum, stat) => sum + stat.count, 0);
  if (totalCount === 0) return 0;
  const totalSum = examStats.reduce(
    (sum, stat) => sum + stat.average * stat.count,
    0
  );
  return totalSum / totalCount;
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
}: {
  average: number;
  classAverage: number | null;
  classAverageLoading: boolean;
}) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Moyennes générales</CardTitle>
        <CardDescription>Vue d'ensemble de vos performances</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Moyenne élève
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {average.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground">
              /20
            </span>
          </p>
        </div>
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Moyenne de la classe
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {classAverageLoading
              ? "..."
              : classAverage !== null
              ? classAverage.toFixed(1)
              : "-"}
            <span className="text-sm font-normal text-muted-foreground">
              /20
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectAveragesList({ notes }: { notes: NoteBackend[] }) {
  const averages = calculateAveragesBySubject(notes);

  if (averages.length === 0) return null;

  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">
          Moyennes par matière
        </CardTitle>
        <CardDescription>Détail par discipline académique</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {averages.map(({ subject, average, count }) => (
          <div key={subject} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{subject}</span>
              <div className="text-right">
                <span className="font-bold">{average.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/20</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({count} note{count > 1 ? "s" : ""})
                </span>
              </div>
            </div>
            <Progress value={(average / 20) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function NoteDetailModal({
  note,
  onClose,
}: {
  note: NoteBackend | null;
  onClose: () => void;
}) {
  if (!note) return null;

  const gradeOn20 = getGradeOn20(note);
  const [classStats, setClassStats] = useState<{
    average: number;
    min: number;
    max: number;
    count: number;
  } | null>(null);
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
    <Dialog open={Boolean(note)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {note.Exam?.Subject?.type ?? "Matière inconnue"}
          </p>
          <DialogTitle className="text-xl font-bold">
            {note.Exam?.title}
          </DialogTitle>
          <DialogDescription>Détails et statistiques de l'évaluation</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Note obtenue */}
          <div className="flex items-center justify-between rounded-xl bg-muted p-4">
            <span className="text-sm font-medium text-muted-foreground">
              Note obtenue
            </span>
            <span className="text-2xl font-bold text-primary">
              {note.grade}/{parseFloat(note.Exam?.maxNotes ?? "20")}
            </span>
          </div>

          {/* Informations complémentaires */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Coefficient</p>
                <p className="text-sm font-bold">{note.Exam?.coefficient}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Équivalent /20</p>
                <p className="text-sm font-bold">{gradeOn20.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date de passage</p>
              <p className="text-sm font-bold">{formatDate(note.createdAt)}</p>
            </div>
          </div>

          {/* Statistiques de classe */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">
                Statistiques de la classe
              </span>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : classStats ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Moyenne</p>
                    <p className="text-sm font-bold">
                      {classStats.average.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                    <p className="text-xs opacity-80">Min</p>
                    <p className="text-sm font-bold">
                      {classStats.min.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                    <p className="text-xs opacity-80">Max</p>
                    <p className="text-sm font-bold">
                      {classStats.max.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground pt-1">
                  Basé sur {classStats.count} copie{classStats.count > 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-2">
                Statistiques indisponibles.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
        const uniqueExamIds = Array.from(
          new Set(notes.map((note) => note.examId))
        );
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
        <div className="p-8 lg:ml-[270px] max-w-md mx-auto my-12">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Veuillez vous connecter pour consulter vos notes.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="p-8 lg:ml-[270px] max-w-md mx-auto my-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const average = calculateWeightedAverage(notes);

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-4">
              Notes & Évaluations
            </h1>
            <div className="grid gap-6 md:grid-cols-2">
              <AverageKpiCard
                average={average}
                classAverage={classAverage}
                classAverageLoading={classAverageLoading}
              />
              <SubjectAveragesList notes={notes} />
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-bold">Mes notes</CardTitle>
                <CardDescription className="mt-1">
                  Cliquez sur une évaluation pour voir le détail des statistiques.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                {notes.length} note{notes.length > 1 ? "s" : ""}
              </Badge>
            </CardHeader>

            <CardContent>
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 stroke-1 mb-3 text-muted-foreground/60" />
                  <p className="text-sm font-medium">
                    Aucune note disponible pour le moment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {notes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setSelectedNote(note)}
                      className="group text-left"
                    >
                      <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md">
                        <CardHeader className="space-y-2 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {note.Exam?.Subject?.type ?? "Matière"}
                              </p>
                              <CardTitle className="mt-1 text-base font-bold group-hover:text-primary transition-colors">
                                {note.Exam?.title}
                              </CardTitle>
                            </div>
                            <Badge variant="outline" className="shrink-0 text-xs font-medium">
                              {formatDate(note.createdAt)}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-2">
                          <div className="grid grid-cols-2 gap-2 border-t pt-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Note</p>
                              <p className="mt-0.5 text-lg font-bold text-foreground">
                                {note.grade}
                                <span className="text-xs font-normal text-muted-foreground">
                                  /{parseFloat(note.Exam?.maxNotes ?? "20")}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Coef.</p>
                              <p className="mt-0.5 text-lg font-bold text-foreground">
                                {note.Exam?.coefficient}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de détail d'une note */}
      <NoteDetailModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </>
  );
}