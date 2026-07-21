"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ID du rôle TEACHER (même convention que le reste du projet, ex: id 14 pour VIE_SCOLAIRE)
const TEACHER_ROLE_ID = 4;

type Option = { id: number; label: string };

export type EditableCourse = {
  id: number;
  startTime: string;
  endTime: string;
  roomId: number | null;
  subjectId: number | null;
  teacherId: number | null;
  recurrent: boolean;
  recurrentUntil: string | null;
};

type CourseFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  gradeId: number | null;
  defaultStart?: Date | null;
  initialCourse?: EditableCourse | null;
  onClose: () => void;
  onSaved: () => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInputValue(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addOneHour(d: Date) {
  return new Date(d.getTime() + 60 * 60 * 1000);
}

function buildIso(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

export default function CourseFormModal({
  open,
  mode,
  gradeId,
  defaultStart,
  initialCourse,
  onClose,
  onSaved,
}: CourseFormModalProps) {
  const [rooms, setRooms] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomId, setRoomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [recurrent, setRecurrent] = useState(false);
  const [recurrentUntil, setRecurrentUntil] = useState("");

  // Charge les options des selects à chaque ouverture
  useEffect(() => {
    if (!open) return;

    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [roomsRes, subjectsRes, teachersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rooms?limit=200`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/subjects`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/users/role/${TEACHER_ROLE_ID}?limit=200`, {
            credentials: "include",
          }),
        ]);

        if (roomsRes.ok) {
          const json = await roomsRes.json();
          setRooms((json.data ?? []).map((r: any) => ({ id: r.id, label: r.name })));
        }

        if (subjectsRes.ok) {
          const json = await subjectsRes.json();
          const list = Array.isArray(json) ? json : [];
          setSubjects(list.map((s: any) => ({ id: s.id, label: s.type })));
        }

        if (teachersRes.ok) {
          const json = await teachersRes.json();
          setTeachers(
            (json.data ?? []).map((u: any) => ({
              id: u.id,
              label: `${u.firstName} ${u.lastName}`,
            }))
          );
        }
      } catch (err) {
        console.error("Erreur de chargement des options du formulaire :", err);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, [open]);

  // Pré-remplit le formulaire selon le mode
  useEffect(() => {
    if (!open) return;
    setError("");

    if (mode === "edit" && initialCourse) {
      const start = new Date(initialCourse.startTime);
      const end = new Date(initialCourse.endTime);
      setDate(toDateInputValue(start));
      setStartTime(toTimeInputValue(start));
      setEndTime(toTimeInputValue(end));
      setRoomId(initialCourse.roomId ? String(initialCourse.roomId) : "");
      setSubjectId(initialCourse.subjectId ? String(initialCourse.subjectId) : "");
      setTeacherId(initialCourse.teacherId ? String(initialCourse.teacherId) : "");
      setRecurrent(!!initialCourse.recurrent);
      setRecurrentUntil(initialCourse.recurrentUntil ?? "");
    } else {
      const start = defaultStart ?? new Date();
      const end = addOneHour(start);
      setDate(toDateInputValue(start));
      setStartTime(toTimeInputValue(start));
      setEndTime(toTimeInputValue(end));
      setRoomId("");
      setSubjectId("");
      setTeacherId("");
      setRecurrent(false);
      setRecurrentUntil("");
    }
  }, [open, mode, initialCourse, defaultStart]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!gradeId) {
      setError("Aucune classe sélectionnée.");
      return;
    }
    if (!date || !startTime || !endTime || !roomId || !subjectId || !teacherId) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (endTime <= startTime) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (recurrent && !recurrentUntil) {
      setError("Merci d'indiquer une date de fin de récurrence.");
      return;
    }

    const payload = {
      startTime: buildIso(date, startTime),
      endTime: buildIso(date, endTime),
      roomId: Number(roomId),
      subjectId: Number(subjectId),
      teacherId: Number(teacherId),
      gradeId,
      recurrent,
      recurrentUntil: recurrent ? recurrentUntil : null,
    };

    const url =
      mode === "create"
        ? `${API_BASE_URL}/api/courses`
        : `${API_BASE_URL}/api/courses/${initialCourse?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      setSubmitting(true);
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de l'enregistrement du cours");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialCourse) return;
    if (!confirm("Supprimer ce cours ? Cette action est irréversible.")) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/courses/${initialCourse.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression du cours");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === "create" ? "Créer un cours" : "Modifier le cours"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loadingOptions ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime">Début</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endTime">Fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subjectId">Matière</Label>
              <select
                id="subjectId"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teacherId">Enseignant</Label>
              <select
                id="teacherId"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Sélectionner un enseignant</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roomId">Salle</Label>
              <select
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Sélectionner une salle</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="recurrent"
                type="checkbox"
                checked={recurrent}
                onChange={(e) => setRecurrent(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="recurrent" className="cursor-pointer">
                Cours récurrent (chaque semaine, même jour et heure)
              </Label>
            </div>

            {recurrent && (
              <div className="space-y-1.5">
                <Label htmlFor="recurrentUntil">Récurrent jusqu'au</Label>
                <Input
                  id="recurrentUntil"
                  type="date"
                  value={recurrentUntil}
                  onChange={(e) => setRecurrentUntil(e.target.value)}
                />
              </div>
            )}

            {mode === "edit" && initialCourse?.recurrent && (
              <p className="text-xs text-muted-foreground">
                Ce cours fait partie d'une série récurrente. Modifier ou supprimer ne
                concerne que cette occurrence, pas les autres.
              </p>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}