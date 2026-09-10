"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CalendarDays, ClipboardCheck, MapPin, AlertCircle, BookOpen } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CourseItem = {
  id: number;
  startTime: string;
  endTime: string;
  Room?: { name: string };
  Subject?: { type: string };
  Grade?: { id: number; name: string };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchTeacherCourses(teacherId: number) {
  const response = await fetch(`${API_BASE_URL}/api/courses/teacher/${teacherId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<CourseItem[]>;
}

function isToday(course: CourseItem) {
  const date = new Date(course.startTime);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

// Fonction pour trier du plus tôt au plus tard
function sortCoursesByTime(courses: CourseItem[]) {
  return [...courses].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AttendanceListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTeacher = user?.Role.role === "TEACHER";

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isTeacher) {
      setLoading(false);
      return;
    }

    fetchTeacherCourses(user.id)
      .then((data) => {
        const todayCourses = data.filter(isToday);
        // Tri du cours le plus tôt au cours le plus tard
        setCourses(sortCoursesByTime(todayCourses));
      })
      .catch((err) => {
        console.error("Erreur chargement cours:", err);
        setError("Impossible de charger vos cours du jour.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, isTeacher]);

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

  if (!user || !isTeacher) {
    return (
      <>
        <Sidebar />
        <div className="p-8 lg:ml-[270px] max-w-md mx-auto my-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès réservé</AlertTitle>
            <AlertDescription>
              Seuls les enseignants peuvent faire l&apos;appel.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold">Faire l&apos;appel</CardTitle>
                <CardDescription className="mt-1">
                  Sélectionnez un cours du jour pour marquer les présences.
                </CardDescription>
              </div>
              <div>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  {courses.length} cours aujourd&apos;hui
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 stroke-1 mb-3 text-muted-foreground/60" />
                  <p className="text-sm font-medium">Aucun cours prévu aujourd&apos;hui.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => (
                    <Link key={course.id} href={`/attendance/${course.id}`} className="group block">
                      <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md">
                        <CardHeader className="space-y-3 pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {course.Subject?.type || "Matière"}
                              </p>
                              <CardTitle className="mt-1 text-lg font-bold group-hover:text-primary transition-colors">
                                {course.Grade?.name || "Classe"}
                              </CardTitle>
                            </div>
                            <Badge variant="default" className="shrink-0 font-medium">
                              {formatTime(course.startTime)} - {formatTime(course.endTime)}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                            <Badge variant="outline" className="gap-1.5 font-normal">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Aujourd&apos;hui
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 font-normal">
                              <MapPin className="h-3.5 w-3.5" />
                              {course.Room?.name || "Salle non spécifiée"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}