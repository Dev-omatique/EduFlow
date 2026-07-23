"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, Users, AlertCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
};@

type AttendanceRecord = {
  id: number;
  comment?: string | null;
  attendanceStatusId: number;
  courseId: number;
  studentId: number;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// D'après attendance_statuses : 1 = Absent injustifié, 3 = Présent
const PRESENT_STATUS_ID = 3;
const ABSENT_STATUS_ID = 1;

async function fetchCourseStudents(courseId: string) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/students`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<Student[]>;
}

async function fetchCourseAttendances(courseId: string) {
  const response = await fetch(`${API_BASE_URL}/api/attendances/cours/${courseId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<AttendanceRecord[]>;
}

async function createAttendance(payload: {
  studentId: number;
  courseId: number;
  attendanceStatusId: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/attendances`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

async function updateAttendance(
  attendanceId: number,
  payload: { attendanceStatusId: number }
) {
  const response = await fetch(`${API_BASE_URL}/api/attendances/${attendanceId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

function isTodayRecord(record: AttendanceRecord) {
  const date = new Date(record.createdAt);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function AttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [existingByStudent, setExistingByStudent] = useState<Record<number, AttendanceRecord>>({});
  const [absentStudents, setAbsentStudents] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<{
    status: "idle" | "saving" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const canEdit = useMemo(() => user?.Role.role === "TEACHER", [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canEdit) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [studentsData, attendancesData] = await Promise.all([
          fetchCourseStudents(courseId),
          fetchCourseAttendances(courseId),
        ]);

        setStudents(studentsData);

        const todayRecords = attendancesData.filter(isTodayRecord);
        const byStudent: Record<number, AttendanceRecord> = {};
        const initialAbsent: Record<number, boolean> = {};

        todayRecords.forEach((record) => {
          byStudent[record.studentId] = record;
          initialAbsent[record.studentId] = record.attendanceStatusId !== PRESENT_STATUS_ID;
        });

        setExistingByStudent(byStudent);
        setAbsentStudents(initialAbsent);
      } catch (err) {
        console.error("Erreur chargement appel:", err);
        setError("Impossible de charger les élèves de ce cours.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, user, canEdit, courseId]);

  const toggleAbsent = (studentId: number) => {
    setAbsentStudents((current) => ({
      ...current,
      [studentId]: !current[studentId],
    }));
  };

  const handleSubmit = async () => {
    setSubmitState({ status: "saving" });

    try {
      await Promise.all(
        students.map((student) => {
          const isAbsent = Boolean(absentStudents[student.id]);
          const statusId = isAbsent ? ABSENT_STATUS_ID : PRESENT_STATUS_ID;
          const existing = existingByStudent[student.id];

          if (existing) {
            return updateAttendance(existing.id, { attendanceStatusId: statusId });
          }

          return createAttendance({
            studentId: student.id,
            courseId: Number(courseId),
            attendanceStatusId: statusId,
          });
        })
      );

      setSubmitState({ status: "success", message: "Appel enregistré avec succès." });
    } catch (err: any) {
      setSubmitState({ status: "error", message: err.message || "Échec lors de l'enregistrement." });
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

  if (!user || !canEdit) {
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

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="p-6 lg:ml-[270px] max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const absentCount = Object.values(absentStudents).filter(Boolean).length;

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-4xl space-y-6 py-6">
          <Card>
            <CardHeader className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="gap-2 rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" /> Retour aux cours
                </Button>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Feuille d&apos;appel</CardTitle>
                  <CardDescription className="mt-1">
                    Cochez les élèves absents. Les autres sont considérés présents.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {students.length} élève{students.length > 1 ? "s" : ""}
                  </Badge>
                  <Badge variant={absentCount > 0 ? "destructive" : "outline"} className="px-3 py-1 text-xs">
                    {absentCount} absent{absentCount > 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead className="w-[100px] text-center">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const isAbsent = Boolean(absentStudents[student.id]);
                      return (
                        <TableRow
                          key={student.id}
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                          onClick={() => toggleAbsent(student.id)}
                        >
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={isAbsent}
                                onCheckedChange={() => toggleAbsent(student.id)}
                                aria-label={`Marquer ${student.firstName} comme absent`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitState.status === "saving"}
                  className="w-full sm:w-auto gap-2"
                >
                  {submitState.status === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {submitState.status === "saving" ? "Enregistrement..." : "Valider l'appel"}
                </Button>

                {submitState.status === "success" && (
                  <Alert className="border-emerald-500/50 text-emerald-600 bg-emerald-500/10">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription>{submitState.message}</AlertDescription>
                  </Alert>
                )}

                {submitState.status === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{submitState.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );

}