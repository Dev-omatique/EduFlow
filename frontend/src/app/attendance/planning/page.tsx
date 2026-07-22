"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, CalendarDays, ClipboardCheck, MapPin, Filter, AlertCircle, BookOpen, User } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CourseItem = {
  id: number;
  startTime: string;
  endTime: string;
  Room?: { id: number; name: string };
  Subject?: { id: number; type: string };
  Grade?: { id: number; name: string };
  teacher?: { id: number; firstName: string; lastName: string };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchAllCourses(startDate: string, endDate: string) {
  const url = `${API_BASE_URL}/api/courses/all/all?startDate=${startDate}&endDate=${endDate}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<CourseItem[]>;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AttendancePlanningPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  const isVieScolaire = user?.Role.role === "VIE_SCOLAIRE";

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isVieScolaire) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAllCourses(startDate, endDate)
      .then((data) => setCourses(data))
      .catch((err) => {
        console.error("Erreur chargement planning:", err);
        setError("Impossible de charger le planning.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, isVieScolaire, startDate, endDate]);

  const availableTeachers = useMemo(() => {
    const map = new Map<number, string>();
    courses.forEach((course) => {
      if (course.teacher) {
        map.set(course.teacher.id, `${course.teacher.firstName} ${course.teacher.lastName}`);
      }
    });
    return Array.from(map.entries());
  }, [courses]);

  const availableGrades = useMemo(() => {
    const map = new Map<number, string>();
    courses.forEach((course) => {
      if (course.Grade) {
        map.set(course.Grade.id, course.Grade.name);
      }
    });
    return Array.from(map.entries());
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const matchesTeacher =
          selectedTeacher === "all" || course.teacher?.id === Number(selectedTeacher);
        const matchesGrade =
          selectedGrade === "all" || course.Grade?.id === Number(selectedGrade);
        return matchesTeacher && matchesGrade;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courses, selectedTeacher, selectedGrade]);

  const hasActiveFilters = selectedTeacher !== "all" || selectedGrade !== "all";

  const resetFilters = () => {
    setSelectedTeacher("all");
    setSelectedGrade("all");
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

  if (!user || !isVieScolaire) {
    return (
      <>
        <Sidebar />
        <div className="p-8 lg:ml-[270px] max-w-md mx-auto my-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès réservé</AlertTitle>
            <AlertDescription>
              Cette page est réservée à la vie scolaire.
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
                <CardTitle className="text-2xl font-bold">Planning des cours</CardTitle>
                <CardDescription className="mt-1">
                  Filtrez par professeur, par classe ou par période.
                </CardDescription>
              </div>
              <div>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  {filteredCourses.length} cours
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Barre de filtres */}
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-auto h-9 bg-background"
                  />
                  <span className="text-sm text-muted-foreground">à</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-auto h-9 bg-background"
                  />
                </div>

                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-[200px] h-9 bg-background">
                    <SelectValue placeholder="Tous les professeurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les professeurs</SelectItem>
                    {availableTeachers.map(([id, name]) => (
                      <SelectItem key={id} value={String(id)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-[180px] h-9 bg-background">
                    <SelectValue placeholder="Toutes les classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {availableGrades.map(([id, name]) => (
                      <SelectItem key={id} value={String(id)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-primary hover:text-primary/80 h-9"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>

              {/* Affichage des cours / erreurs */}
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 stroke-1 mb-3 text-muted-foreground/60" />
                  <p className="text-sm font-medium">Aucun cours ne correspond à ces filtres.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/attendance/planning/${course.id}`}
                      className="group block"
                    >
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
                              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                {course.teacher
                                  ? `${course.teacher.firstName} ${course.teacher.lastName}`
                                  : "Professeur non renseigné"}
                              </p>
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
                              {formatDate(course.startTime)}
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