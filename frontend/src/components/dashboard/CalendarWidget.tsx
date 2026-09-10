"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CalendarDays, Clock, MapPin, User as UserIcon, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";



import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPastelHex } from "@/utils/color";
import CourseDetailsModal, { CourseDetails } from "@/components/courses/CourseDetailsModal";

type CourseBackend = {
  id: number;
  startTime: string;
  endTime: string;
  teacher?: { firstName: string; lastName: string };
  Room?: { name: string };
  Subject?: { type: string; color?: string };
  Grade?: { name: string };
  statusId?: number | null;
  recurrent?: boolean;
  recurrentUntil?: string;
  status?: { id: number; label: string };
};

type User = {
  id: number;
  Role: { role: string };
  Grade?: { id: number; name: string };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchCourses(user: User) {
  const isStudent = user.Role.role?.toUpperCase() === "STUDENT";
  const type = isStudent ? "grade" : "teacher";
  const targetId = isStudent ? user.Grade?.id : user.id;

  if (!targetId) return [];

  const url = `${API_BASE_URL}/api/courses/${type}/${targetId}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<CourseBackend[]>;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sortCourses(courses: CourseBackend[]) {
  return [...courses].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function isToday(course: CourseBackend) {
  const date = new Date(course.startTime);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function CalendarWidget() {
  const { user, isLoading } = useAuth();
  const [courses, setCourses] = useState<CourseBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCourseToView, setSelectedCourseToView] = useState<CourseDetails | null>(null);

  const isTeacher = user?.Role?.role?.toUpperCase() === "TEACHER";

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetchCourses(user)
      .then((data) => setCourses(sortCourses(data.filter(isToday))))
      .catch((err) => {
        console.error("Failed to fetch courses:", err);
        setError("Impossible de charger les cours.");
      })
      .finally(() => setLoading(false));
  }, [isLoading, user]);

  const handleCourseClick = (course: CourseBackend) => {
    const participant = isTeacher
      ? course.Grade?.name || "Classe non spécifiée"
      : course.teacher
      ? `${course.teacher.firstName} ${course.teacher.lastName}`
      : "Professeur non renseigné";

    setSelectedCourseToView({
      title: course.Subject?.type || "Cours",
      start: course.startTime,
      end: course.endTime,
      participant,
      room: course.Room?.name || "Sans salle",
      statusLabel: course.status?.label || null,
      recurrent: course.recurrent,
      recurrentUntil: course.recurrentUntil,
    });
    setIsViewModalOpen(true);
  };

  if (isLoading || loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
          <span className="text-sm">Chargement des cours...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connexion requise</AlertTitle>
        <AlertDescription>
          Connectez-vous pour voir votre emploi du temps.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Cours du jour</CardTitle>
            <CardDescription className="mt-1">
              Vos cours prévus aujourd'hui
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {courses.length} cours
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8 stroke-1 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">Aucun cours prévu aujourd'hui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const subjectColor = course.Subject?.color || null;

              // Même logique que dans Calendar.tsx : fond pastel + bordure de la couleur de la matière
              const dynamicStyle = subjectColor
                ? {
                    borderLeftColor: subjectColor,
                    backgroundColor: getPastelHex(subjectColor, 0.85),
                  }
                : {};

              return (
                <div
                  key={course.id}
                  style={dynamicStyle}
                  onClick={() => handleCourseClick(course)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-l-[3px] bg-muted/30 p-3.5 transition-colors hover:brightness-95 cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {course.Subject?.type || "Cours"}
                    </p>

                    {/* Affichage conditionnel : Classe si Prof, Prof si Élève */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {isTeacher ? (
                        <>
                          <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{course.Grade?.name || "Classe non spécifiée"}</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {course.teacher
                              ? `${course.teacher.firstName} ${course.teacher.lastName}`
                              : "Professeur non renseigné"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 gap-1 text-xs">
                    <Badge variant="outline" className="gap-1 font-semibold">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatTime(course.startTime)} - {formatTime(course.endTime)}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {course.Room?.name || "Salle non spécifiée"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {isViewModalOpen && selectedCourseToView && (
        <CourseDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          course={selectedCourseToView}
          userRole={user.Role.role}
        />
      )}
    </Card>
  );
}