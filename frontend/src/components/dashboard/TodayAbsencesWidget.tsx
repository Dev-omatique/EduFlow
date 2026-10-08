"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Loader2, UserRoundX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

function isToday(dateString: string, today: string) {
  const date = new Date(dateString);
  return localDateString(date) === today;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<T>;
}

async function fetchTodayAbsences(today: string): Promise<AbsenceItem[]> {
  const courses = await getJson<Course[]>(
    `/api/courses/all/all?startDate=${today}T00:00:00.000&endDate=${today}T23:59:59.999`
  );
  const courseById = new Map(courses.map((course) => [baseCourseId(course.id), course]));
  const coursesByGrade = new Map<number, Course>();

  courses.forEach((course) => {
    if (course.gradeId && !coursesByGrade.has(course.gradeId)) {
      coursesByGrade.set(course.gradeId, course);
    }
  });

  const [attendanceGroups, studentGroups] = await Promise.all([
    Promise.all(
      Array.from(courseById.keys()).map(async (courseId) => ({
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
    const course = courseById.get(courseId);
    if (!course) return [];

    return records
      .filter((record) => record.attendanceStatusId !== PRESENT_STATUS_ID && isToday(record.createdAt, today))
      .flatMap((record) => {
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

export default function TodayAbsencesWidget() {
  const [items, setItems] = useState<AbsenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = localDateString(new Date());

  useEffect(() => {
    let cancelled = false;

    fetchTodayAbsences(today)
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
  }, [today]);

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
            <CardTitle className="text-lg font-bold">Élèves absents aujourd&apos;hui</CardTitle>
            <CardDescription className="mt-1">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </CardDescription>
          </div>
          <Badge variant={items.length > 0 ? "destructive" : "secondary"} className="gap-1.5 px-3 py-1">
            <UserRoundX className="h-3.5 w-3.5" />
            {items.length} absent{items.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">{renderContent()}</CardContent>
    </Card>
  );
}