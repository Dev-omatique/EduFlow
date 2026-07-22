"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, Users, AlertCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
};

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

// Status IDs : 1 = Absent injustifié, 3 = Présent, 4 = Absent justifié
const PRESENT_STATUS_ID = 3;
const ABSENT_STATUS_ID = 1;
const ABSENT_JUSTIFIED_STATUS_ID = 4;

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
  comment?: string;
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
  payload: { attendanceStatusId: number; comment?: string }
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
  const [justifiedStudents, setJustifiedStudents] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<{ status: "idle" | "saving" | "success" | "error"; message?: string }>({ status: "idle" });

  const canEdit = useMemo(
    () => user?.Role.role === "TEACHER" || user?.Role.role === "VIE_SCOLAIRE",
    [user]
  );
  const canManageJustification = useMemo(() => user?.Role.role === "VIE_SCOLAIRE", [user]);

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
        const initialJustified: Record<number, boolean> = {};
        const initialComments: Record<number, string> = {};

        todayRecords.forEach((record) => {
          byStudent[record.studentId] = record;
          initialAbsent[record.studentId] = record.attendanceStatusId !== PRESENT_STATUS_ID;
          initialJustified[record.studentId] = record.attendanceStatusId === ABSENT_JUSTIFIED_STATUS_ID;
          initialComments[record.studentId] = record.comment || "";
        });

        setExistingByStudent(byStudent);
        setAbsentStudents(initialAbsent);
        setJustifiedStudents(initialJustified);
        setComments(initialComments);
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

  const toggleJustified = (studentId: number) => {
    setJustifiedStudents((current) => ({
      ...current,
      [studentId]: !current[studentId],
    }));
  };

  const handleCommentChange = (studentId: number, value: string) => {
    setComments((current) => ({
      ...current,
      [studentId]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitState({ status: "saving" });

    try {
      await Promise.all(
        students.map((student) => {
          const isAbsent = Boolean(absentStudents[student.id]);
          const isJustified = Boolean(justifiedStudents[student.id]);
          const existing = existingByStudent[student.id];

          let statusId = PRESENT_STATUS_ID;
          if (isAbsent) {
            statusId = canManageJustification && isJustified
              ? ABSENT_JUSTIFIED_STATUS_ID
              : ABSENT_STATUS_ID;
          }

          const payload: { attendanceStatusId: number; comment?: string } = { attendanceStatusId: statusId };
          if (canManageJustification) {
            payload.comment = comments[student.id] || "";
          }

          if (existing) {
            return updateAttendance(existing.id, payload);
          }

          return createAttendance({
            studentId: student.id,
            courseId: Number(courseId),
            ...payload,
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
              Réservé aux enseignants et à la vie scolaire.
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
        <div className="p-8 lg:ml-[270px] max-w-xl mx-auto my-12">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux cours
          </Button>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-6">
              <div>
                <CardTitle className="text-2xl font-bold">Feuille d&apos;appel</CardTitle>
                <CardDescription className="mt-1">
                  Cochez les élèves absents. Les autres sont considérés présents.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium w-fit">
                <Users className="h-4 w-4 text-primary" />
                {students.length} élève{students.length > 1 ? "s" : ""} · {absentCount} absent{absentCount > 1 ? "s" : ""}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Tableau d'appel */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Élève</TableHead>
                      <TableHead className="w-[120px] font-semibold">Absent</TableHead>
                      {canManageJustification && (
                        <TableHead className="font-semibold">Justificatif & Remarques</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const isAbsent = Boolean(absentStudents[student.id]);
                      const isJustified = Boolean(justifiedStudents[student.id]);
                      return (
                        <TableRow key={student.id} className="align-top">
                          <TableCell className="font-medium pt-4">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell className="pt-4">
                            <Checkbox
                              checked={isAbsent}
                              onCheckedChange={() => toggleAbsent(student.id)}
                            />
                          </TableCell>
                          {canManageJustification && (
                            <TableCell className="pt-4">
                              {isAbsent ? (
                                <div className="space-y-3 max-w-md">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`justified-${student.id}`}
                                      checked={isJustified}
                                      onCheckedChange={() => toggleJustified(student.id)}
                                    />
                                    <label
                                      htmlFor={`justified-${student.id}`}
                                      className="text-xs font-medium leading-none cursor-pointer"
                                    >
                                      Absence justifiée
                                    </label>
                                  </div>
                                  <Input
                                    type="text"
                                    value={comments[student.id] ?? ""}
                                    onChange={(event) =>
                                      handleCommentChange(student.id, event.target.value)
                                    }
                                    placeholder="Motif / commentaire"
                                    className="h-8 text-xs bg-background"
                                  />
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Action de validation */}
              <div className="flex flex-col items-start gap-4 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitState.status === "saving"}
                  className="gap-2 rounded-full font-semibold"
                >
                  {submitState.status === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Valider l&apos;appel
                    </>
                  )}
                </Button>

                {submitState.status === "success" && (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription className="text-emerald-800">
                      {submitState.message}
                    </AlertDescription>
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