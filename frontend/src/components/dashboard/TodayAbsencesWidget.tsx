"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Filter, Loader2, UserRoundX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Course = {
  id: number | string;
  startTime: string;
  endTime: string;
  gradeId: number;
  teacher?: { firstName: string; lastName: string };
  Subject?: { type: string };
  Grade?: { name: string };
};

type Student = { id: number; firstName: string; lastName: string };

type AttendanceRecord = {
  id: number;
  comment?: string | null;
  attendanceStatusId: number;
  courseId: number;
  studentId: number;
  createdAt: string;
};

type AbsenceItem = {
  id: string;
  studentName: string;
  gradeName: string;
  courseName: string;
  startTime: string;
  comment?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PRESENT_STATUS_ID = 3;

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function baseCourseId(id: number | string) {
  return String(id).split("_")[0];
}

function isWithinRange(dateString: string, startDate: string, endDate: string) {
  const date = localDateString(new Date(dateString));
  return date >= startDate && date <= endDate;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<T>;
}

async function fetchAbsences(startDate: string, endDate: string): Promise<AbsenceItem[]> {
  const query = new URLSearchParams({
    startDate: `${startDate}T00:00:00.000`,
    endDate: `${endDate}T23:59:59.999`,
  });
  const courses = await getJson<Course[]>(
    `/api/courses/all/all?${query.toString()}`
  );
  const coursesByBaseId = new Map<string, Course[]>();
  const coursesByGrade = new Map<number, Course>();

  courses.forEach((course) => {
    const baseId = baseCourseId(course.id);
    const occurrences = coursesByBaseId.get(baseId) || [];
    occurrences.push(course);
    coursesByBaseId.set(baseId, occurrences);

    if (course.gradeId && !coursesByGrade.has(course.gradeId)) {
      coursesByGrade.set(course.gradeId, course);
    }
  });

  const [attendanceGroups, studentGroups] = await Promise.all([
    Promise.all(
      Array.from(coursesByBaseId.keys()).map(async (courseId) => ({
        courseId,
        records: await getJson<AttendanceRecord[]>(`/api/attendances/cours/${courseId}`),
      }))
    ),
    Promise.all(
      Array.from(coursesByGrade.entries()).map(async ([gradeId, course]) => ({
        gradeId,
        students: await getJson<Student[]>(`/api/courses/${baseCourseId(course.id)}/students`),
      }))
    ),
  ]);

  const studentsByGrade = new Map(studentGroups.map(({ gradeId, students }) => [
    gradeId,
    new Map(students.map((student) => [student.id, student])),
  ]));

  return attendanceGroups.flatMap(({ courseId, records }) => {
    return records
      .filter((record) => record.attendanceStatusId !== PRESENT_STATUS_ID && isWithinRange(record.createdAt, startDate, endDate))
      .flatMap((record) => {
        const course = coursesByBaseId
          .get(courseId)
          ?.find((occurrence) => isWithinRange(occurrence.startTime, localDateString(new Date(record.createdAt)), localDateString(new Date(record.createdAt))));
        if (!course) return [];
        const student = studentsByGrade.get(course.gradeId)?.get(record.studentId);
        if (!student) return [];

        return [{
          id: `${courseId}-${record.id}`,
          studentName: `${student.firstName} ${student.lastName}`,
          gradeName: course.Grade?.name || "Classe non renseignée",
          courseName: course.Subject?.type || "Cours",
          startTime: course.startTime,
          comment: record.comment,
        }];
      });
  }).sort((a, b) => a.startTime.localeCompare(b.startTime) || a.studentName.localeCompare(b.studentName));
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("fr-FR");
}

export default function TodayAbsencesWidget({ showFilters = false }: Readonly<{ showFilters?: boolean }>) {
  const [items, setItems] = useState<AbsenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = localDateString(new Date());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    if (startDate > endDate) {
      setItems([]);
      setError("La date de début doit précéder la date de fin.");
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    fetchAbsences(startDate, endDate)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        console.error("Failed to fetch today's absences:", err);
        if (!cancelled) setError("Impossible de charger les absences du jour.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    setStartDate(localDateString(start));
    setEndDate(localDateString(end));
  };

  const resetToToday = () => {
    setStartDate(today);
    setEndDate(today);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
          <span className="text-sm">Chargement des absences...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <CheckCircle2 className="mb-2 h-8 w-8 stroke-1 text-primary" />
          <p className="text-sm font-medium">Aucun élève absent déclaré aujourd&apos;hui.</p>
        </div>
      );
    }

    return (
      <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{item.studentName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.gradeName} · {item.courseName}
                {item.comment ? ` · ${item.comment}` : ""}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTime(item.startTime)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold">
              {showFilters ? "Suivi des absences" : "Élèves absents aujourd&apos;hui"}
            </CardTitle>
            <CardDescription className="mt-1">
              {showFilters
                ? `${formatDate(startDate)} au ${formatDate(endDate)}`
                : new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </CardDescription>
          </div>
          <Badge variant={items.length > 0 ? "destructive" : "secondary"} className="gap-1.5 px-3 py-1">
            <UserRoundX className="h-3.5 w-3.5" />
            {items.length} absent{items.length > 1 ? "s" : ""}
          </Badge>
        </div>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" /> Période
            </span>
            <Button variant="outline" size="sm" onClick={resetToToday}>Aujourd&apos;hui</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange(7)}>7 jours</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange(30)}>30 jours</Button>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <Input aria-label="Date de début" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-auto" />
              <span className="text-sm text-muted-foreground">au</span>
              <Input aria-label="Date de fin" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-auto" />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">{renderContent()}</CardContent>
      {!showFilters && (
        <div className="px-6 pb-5">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/attendance/absences">
              <CalendarDays className="h-4 w-4" /> Suivre les absences par période
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}