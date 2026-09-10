"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Plus } from "lucide-react";

// Composants shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Grade = {
  id: number;
  name: string;
};

type Subject = {
  id: number;
  type: string;
};

type CreateExamPayload = {
  title: string;
  description: string;
  dueDate: string;
  maxNotes: string;
  coefficient: number;
  isGraded: boolean;
  subjectId: number;
  gradeId: number;
  teacherId: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchGrades() {
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<Grade[]>;
}

async function fetchSubjects() {
  const response = await fetch(`${API_BASE_URL}/api/subjects`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<Subject[]>;
}

async function createExam(payload: CreateExamPayload) {
  const response = await fetch(`${API_BASE_URL}/api/exams`, {
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

const emptyForm = {
  title: "",
  description: "",
  dueDate: "",
  maxNotes: "20",
  coefficient: "1",
  isGraded: true,
  subjectId: "",
  gradeId: "",
};

type CreateExamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherId: number;
  defaultGradeId?: number | null;
  /** Fournit un bouton "Créer un devoir" prêt à l'emploi qui pilote lui-même l'ouverture. */
  trigger?: boolean;
};

export default function CreateExamModal({
  isOpen,
  onClose,
  onSuccess,
  teacherId,
  defaultGradeId,
  trigger = false,
}: CreateExamModalProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [createState, setCreateState] = useState<{
    status: "idle" | "saving" | "error";
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    if (!isOpen) return;

    setOptionsError(null);

    fetchGrades()
      .then(setGrades)
      .catch((err) => {
        console.error("Erreur chargement classes:", err);
        setOptionsError((prev) => prev || "Impossible de charger les classes.");
      });

    fetchSubjects()
      .then(setSubjects)
      .catch((err) => {
        console.error("Erreur chargement matières:", err);
        setOptionsError((prev) => prev || "Impossible de charger les matières.");
      });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && defaultGradeId) {
      setForm((f) => ({ ...f, gradeId: String(defaultGradeId) }));
    }
  }, [isOpen, defaultGradeId]);

  const resetForm = () => {
    setForm({ ...emptyForm, gradeId: defaultGradeId ? String(defaultGradeId) : "" });
    setCreateState({ status: "idle" });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.dueDate || !form.subjectId || !form.gradeId) {
      setCreateState({ status: "error", message: "Merci de remplir tous les champs obligatoires." });
      return;
    }

    setCreateState({ status: "saving" });

    try {
      await createExam({
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
        maxNotes: form.isGraded ? form.maxNotes : "0",
        coefficient: form.isGraded ? Number(form.coefficient) : 0,
        isGraded: form.isGraded,
        subjectId: Number(form.subjectId),
        gradeId: Number(form.gradeId),
        teacherId,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setCreateState({
        status: "error",
        message: err.message || "Échec de la création du devoir.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Créer un devoir
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un devoir</DialogTitle>
          <DialogDescription>
            Renseignez les informations du contrôle à venir.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {optionsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{optionsError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="exam-title">Titre *</Label>
            <Input
              id="exam-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Contrôle chapitre 3"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="exam-description">Description</Label>
            <Textarea
              id="exam-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Détails du contrôle (facultatif)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="exam-subject">Matière *</Label>
              <Select
                value={form.subjectId}
                onValueChange={(value) => setForm((f) => ({ ...f, subjectId: value }))}
              >
                <SelectTrigger id="exam-subject">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exam-grade">Classe *</Label>
              <Select
                value={form.gradeId}
                onValueChange={(value) => setForm((f) => ({ ...f, gradeId: value }))}
              >
                <SelectTrigger id="exam-grade">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="exam-isGraded">Devoir noté</Label>
              <p className="text-xs text-muted-foreground">
                Désactivez si c&apos;est un simple devoir, sans note à saisir.
              </p>
            </div>
            <Switch
              id="exam-isGraded"
              checked={form.isGraded}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, isGraded: checked }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="exam-dueDate">Date *</Label>
              <Input
                id="exam-dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            {form.isGraded && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="exam-maxNotes">Note max</Label>
                  <Input
                    id="exam-maxNotes"
                    type="number"
                    min="1"
                    value={form.maxNotes}
                    onChange={(e) => setForm((f) => ({ ...f, maxNotes: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exam-coefficient">Coefficient</Label>
                  <Input
                    id="exam-coefficient"
                    type="number"
                    min="1"
                    value={form.coefficient}
                    onChange={(e) => setForm((f) => ({ ...f, coefficient: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          {createState.status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{createState.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createState.status === "saving"}
          >
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={createState.status === "saving"}>
            {createState.status === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Créer le devoir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}