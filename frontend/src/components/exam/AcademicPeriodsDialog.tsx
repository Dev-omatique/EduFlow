"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AcademicPeriod = {
  id: number;
  label: string;
  periodType: "TRIMESTER" | "SEMESTER";
  number: number;
  schoolYear: string;
  startDate: string | null;
  endDate: string | null;
};

type PeriodForm = {
  label: string;
  periodType: "TRIMESTER" | "SEMESTER";
  number: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const emptyForm: PeriodForm = {
  label: "",
  periodType: "TRIMESTER",
  number: "1",
  schoolYear: "",
  startDate: "",
  endDate: "",
};

async function requestPeriods(path = "", options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}/api/academic-periods${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `Erreur HTTP ${response.status}`);
  return payload;
}

export default function AcademicPeriodsDialog({
  isOpen,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [form, setForm] = useState<PeriodForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      setPeriods(await requestPeriods());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les périodes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) void loadPeriods();
  }, [isOpen]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const savePeriod = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const generatedLabel = `${form.periodType === "TRIMESTER" ? "Trimestre" : "Semestre"} ${form.number}`;
    const payload = {
      ...form,
      label: form.label.trim() || generatedLabel,
      number: Number(form.number),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    try {
      await requestPeriods(editingId ? `/${editingId}` : "", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      resetForm();
      await loadPeriods();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d’enregistrer la période.");
    } finally {
      setSaving(false);
    }
  };

  const editPeriod = (period: AcademicPeriod) => {
    setEditingId(period.id);
    setForm({
      label: period.label,
      periodType: period.periodType,
      number: String(period.number),
      schoolYear: period.schoolYear,
      startDate: period.startDate || "",
      endDate: period.endDate || "",
    });
  };

  const deletePeriod = async (period: AcademicPeriod) => {
    setError(null);
    try {
      await requestPeriods(`/${period.id}`, { method: "DELETE" });
      await loadPeriods();
      if (editingId === period.id) resetForm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossible de supprimer la période.");
    }
  };

  const maxPeriodNumber = form.periodType === "TRIMESTER" ? 3 : 2;
  let saveIcon = <Plus className="h-4 w-4" />;
  if (editingId !== null) saveIcon = <Pencil className="h-4 w-4" />;
  if (saving) saveIcon = <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuration des périodes scolaires</DialogTitle>
          <DialogDescription>
            Configurez les trimestres ou semestres, puis associez-les aux examens.
          </DialogDescription>
        </DialogHeader>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        <form onSubmit={savePeriod} className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="period-type">Découpage</Label>
            <Select
              value={form.periodType}
              onValueChange={(value: "TRIMESTER" | "SEMESTER") => setForm((current) => {
                const maxNumber = value === "TRIMESTER" ? 3 : 2;
                const number = Number(current.number) > maxNumber ? "1" : current.number;
                return { ...current, periodType: value, number };
              })}
            >
              <SelectTrigger id="period-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIMESTER">Trimestres (1 à 3)</SelectItem>
                <SelectItem value="SEMESTER">Semestres (1 à 2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="period-number">Numéro</Label>
            <Select value={form.number} onValueChange={(number) => setForm((current) => ({ ...current, number }))}>
              <SelectTrigger id="period-number"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxPeriodNumber }, (_, index) => String(index + 1)).map((number) => (
                  <SelectItem key={number} value={number}>{number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="period-school-year">Année scolaire</Label>
            <Input
              id="period-school-year"
              value={form.schoolYear}
              onChange={(event) => setForm((current) => ({ ...current, schoolYear: event.target.value }))}
              placeholder="2026-2027"
              pattern="[0-9]{4}-[0-9]{4}"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="period-label">Libellé (facultatif)</Label>
            <Input
              id="period-label"
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              placeholder={form.periodType === "TRIMESTER" ? "Trimestre 1" : "Semestre 1"}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="period-start">Date de début (facultative)</Label>
            <Input id="period-start" type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="period-end">Date de fin (facultative)</Label>
            <Input id="period-end" type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saveIcon}
              {editingId ? "Enregistrer les modifications" : "Ajouter la période"}
            </Button>
            {editingId !== null && <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>}
          </div>
        </form>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Périodes configurées</h3>
          {loading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>}
          {!loading && periods.length === 0 && (
            <p className="py-5 text-sm text-muted-foreground">Aucune période configurée.</p>
          )}
          {!loading && periods.length > 0 && (
            <ul className="divide-y rounded-md border">
              {periods.map((period) => (
                <li key={period.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{period.label} · {period.schoolYear}</span>
                    {(period.startDate || period.endDate) && (
                      <span className="text-xs text-muted-foreground">{period.startDate || "…"} – {period.endDate || "…"}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="ghost" aria-label={`Modifier ${period.label}`} onClick={() => editPeriod(period)}><Pencil className="h-4 w-4" /></Button>
                    <Button type="button" size="icon" variant="ghost" aria-label={`Supprimer ${period.label}`} onClick={() => deletePeriod(period)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}