"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CalendarDays, BookOpen, Users } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

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
          <p className="mt-2 text-sm opacity-80">
            Veuillez vous connecter pour accéder à la liste des examens.
          </p>
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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Examens</h1>
                <p className="mt-2 text-sm text-slate-600">
                  {user.Role.role === "TEACHER"
                    ? "Sélectionnez un contrôle pour ouvrir la feuille de notes."
                    : "Consultez les examens prévus pour votre classe."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
                <BookOpen className="h-4 w-4 text-primary" />
                {exams.length} examen{exams.length > 1 ? "s" : ""}
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : exams.length === 0 ? (
              <div className="rounded-2xl border border-border bg-slate-50 p-6 text-center text-sm text-slate-600">
                Aucun examen à afficher pour le moment.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {exams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/notes/exams/${exam.id}`}
                    className="group rounded-3xl border border-border bg-slate-50 p-5 transition hover:border-primary hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {exam.Subject?.type || "Matière"}
                        </p>
                        <h2 className="mt-3 text-lg font-semibold text-slate-900">
                          {exam.title}
                        </h2>
                      </div>
                      <div className="rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                        {exam.coefficient}x
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {exam.description || "Pas de description"}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        {formatDate(exam.dueDate)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        {exam.Grade?.name || "Classe"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
