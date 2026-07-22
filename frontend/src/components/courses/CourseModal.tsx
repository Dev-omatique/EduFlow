'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar, Clock, MapPin, User, BookOpen, GraduationCap, Repeat, Trash2, Tag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type Grade = { id: number; name: string }
type Subject = { id: number; type: string }
type Teacher = { id: number; firstName: string; lastName: string }
type Room = { id: number; name: string }
type CourseStatus = { id: number; label: string }

interface CourseToEdit {
  readonly id: number | string
  readonly courseId?: number | string
  readonly gradeId: number
  readonly subjectId: number
  readonly teacherId: number
  readonly roomId: number
  readonly statusId?: number | null
  readonly startTime: string
  readonly endTime: string
  readonly recurrent?: boolean
  readonly recurrentUntil?: string | null
}

type CourseModalProps = Readonly<{
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultGradeId?: number | null
  grades: Grade[]
  initialDate?: string
  initialStartTime?: string
  initialEndTime?: string
  courseToEdit?: CourseToEdit | null
}>

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function CourseModal({
  isOpen,
  onClose,
  onSuccess,
  defaultGradeId,
  grades,
  initialDate,
  initialStartTime,
  initialEndTime,
  courseToEdit
}: CourseModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [courseStatuses, setCourseStatuses] = useState<CourseStatus[]>([])

  const [gradeId, setGradeId] = useState<string>('')
  const [subjectId, setSubjectId] = useState<string>('')
  const [teacherId, setTeacherId] = useState<string>('')
  const [roomId, setRoomId] = useState<string>('')
  const [statusId, setStatusId] = useState<string>('')

  const [courseDate, setCourseDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')

  const [recurrent, setRecurrent] = useState<boolean>(false)
  const [recurrentUntil, setRecurrentUntil] = useState<string>('')

  const [editScope, setEditScope] = useState<'all' | 'exception'>('all')
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!courseToEdit
  const isRecurrentCourse = isEditing && !!courseToEdit.recurrent

  useEffect(() => {
    if (!isOpen) {
      setCourseDate('')
      setStartTime('')
      setEndTime('')
      setSubjectId('')
      setTeacherId('')
      setRoomId('')
      setStatusId('')
      setRecurrent(false)
      setRecurrentUntil('')
      setConfirmDelete(false)
      setEditScope('all')
      return
    }

    setConfirmDelete(false)
    setEditScope('all')

    if (!courseToEdit) {
      if (defaultGradeId) setGradeId(String(defaultGradeId))
      if (initialDate) setCourseDate(initialDate)
      if (initialStartTime) setStartTime(initialStartTime)
      if (initialEndTime) setEndTime(initialEndTime)
      setStatusId('')
      return
    }

    setGradeId(String(courseToEdit.gradeId || ''))
    setSubjectId(String(courseToEdit.subjectId || ''))
    setTeacherId(String(courseToEdit.teacherId || ''))
    setRoomId(String(courseToEdit.roomId || ''))
    setStatusId(courseToEdit.statusId ? String(courseToEdit.statusId) : '')

    if (courseToEdit.startTime) {
      const startDate = new Date(courseToEdit.startTime)
      setCourseDate(startDate.toISOString().split('T')[0])
      setStartTime(startDate.toTimeString().substring(0, 5))
    }
    if (courseToEdit.endTime) {
      const endDate = new Date(courseToEdit.endTime)
      setEndTime(endDate.toTimeString().substring(0, 5))
    }
    setRecurrent(!!courseToEdit.recurrent)
    setRecurrentUntil(courseToEdit.recurrentUntil ? courseToEdit.recurrentUntil.split('T')[0] : '')
  }, [isOpen, courseToEdit, defaultGradeId, initialDate, initialStartTime, initialEndTime])

  useEffect(() => {
    if (!isOpen) return

    async function fetchOptions() {
      setLoadingOptions(true)
      setError(null)
      try {
        const [resSubjects, resTeachers, resRooms, resStatuses] = await Promise.all([
          fetch(`${API_BASE_URL}/api/subjects`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/users/role/4`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/rooms`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/course-statuses`, { credentials: 'include' }),
        ])

        if (resSubjects.ok) {
          const data = await resSubjects.json()
          setSubjects(Array.isArray(data) ? data : data.subjects || data.data || [])
        }

        if (resTeachers.ok) {
            const data = await resTeachers.json()
            setTeachers(data.data ?? [])
        }

        if (resRooms.ok) {
          const data = await resRooms.json()
          setRooms(Array.isArray(data) ? data : data.rooms || data.data || [])
        }

        if (resStatuses.ok) {
          const data = await resStatuses.json()
          setCourseStatuses(Array.isArray(data) ? data : data.statuses || data.data || [])
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des options:", err)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [isOpen])

  const getPayload = (startIso: string, endIso: string) => ({
    gradeId: Number(gradeId),
    subjectId: Number(subjectId),
    teacherId: Number(teacherId),
    roomId: Number(roomId),
    statusId: statusId ? Number(statusId) : null,
    startTime: startIso,
    endTime: endIso,
    recurrent,
    recurrentUntil: recurrent && recurrentUntil ? recurrentUntil : null,
  })

  const buildRequest = (startIso: string, endIso: string) => {
    if (!isEditing) {
      return {
        url: `${API_BASE_URL}/api/courses`,
        method: 'POST',
        payload: getPayload(startIso, endIso)
      }
    }

    if (editScope === 'exception') {
      return {
        url: `${API_BASE_URL}/api/courses`,
        method: 'POST',
        payload: {
          ...getPayload(startIso, endIso),
          recurrent: false,
          recurrentUntil: null,
        }
      }
    }

    return {
      url: `${API_BASE_URL}/api/courses/${courseToEdit.id}`,
      method: 'PUT',
      payload: getPayload(startIso, endIso)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (startTime >= endTime) {
      setError("L'heure de fin doit être supérieure à l'heure de début.")
      setSubmitting(false)
      return
    }

    try {
      const startDateTime = new Date(`${courseDate}T${startTime}`)
      const endDateTime = new Date(`${courseDate}T${endTime}`)

      const { url, method, payload } = buildRequest(startDateTime.toISOString(), endDateTime.toISOString())

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "Impossible d'enregistrer les modifications")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!courseToEdit || !confirmDelete) return
    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseToEdit.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "Impossible de supprimer le cours")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la suppression.")
    } finally {
      setDeleting(false)
    }
  }

  const getSubmitButtonText = () => {
    if (!isEditing) return "Créer le cours"
    return editScope === 'exception' ? "Créer l'exception" : "Modifier la série"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border border-border text-foreground rounded-2xl overflow-hidden flex flex-col p-0 max-h-[90vh]">
        
        {/* En-tête */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4 space-y-0 bg-background/50">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <DialogTitle>{isEditing ? "Modifier le cours" : "Planifier un nouveau cours"}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Formulaire global */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            {/* Option pour les cours récurrents */}
            {isRecurrentCourse && (
              <div className="p-3.5 rounded-xl bg-accent/50 border border-border space-y-2.5">
                <span className="text-xs font-semibold block text-muted-foreground uppercase tracking-wider">
                  Portée de la modification (Cours récurrent)
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="radio"
                      name="editScope"
                      value="all"
                      checked={editScope === 'all'}
                      onChange={() => setEditScope('all')}
                      className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span>Modifier toute la série</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="radio"
                      name="editScope"
                      value="exception"
                      checked={editScope === 'exception'}
                      onChange={() => setEditScope('exception')}
                      className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span>Créer une exception (ce cours uniquement)</span>
                  </label>
                </div>
              </div>
            )}

            {loadingOptions ? (
              <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Chargement des modules...</span>
              </div>
            ) : (
              <>
                {/* Classe */}
                <div className="space-y-1.5">
                  <Label htmlFor="grade-select" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" /> Classe
                  </Label>
                  <Select value={gradeId} onValueChange={setGradeId}>
                    <SelectTrigger id="grade-select" className="w-full bg-background border-border rounded-xl">
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Matière & Enseignant */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="subject-select" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="h-4 w-4" /> Matière
                    </Label>
                    <Select value={subjectId} onValueChange={setSubjectId}>
                      <SelectTrigger id="subject-select" className="w-full bg-background border-border rounded-xl">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="teacher-select" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-4 w-4" /> Enseignant
                    </Label>
                    <Select value={teacherId} onValueChange={setTeacherId}>
                      <SelectTrigger id="teacher-select" className="w-full bg-background border-border rounded-xl">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>{t.firstName} {t.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Salle */}
                <div className="space-y-1.5">
                  <Label htmlFor="room-select" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> Salle
                  </Label>
                  <Select value={roomId} onValueChange={setRoomId}>
                    <SelectTrigger id="room-select" className="w-full bg-background border-border rounded-xl">
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(rooms) && rooms.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Statut du cours (Optionnel) */}
                <div className="space-y-1.5">
                  <Label htmlFor="status-select" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <Tag className="h-4 w-4" /> Statut du cours (Optionnel)
                  </Label>
                  <Select value={statusId || "none"} onValueChange={(val) => setStatusId(val === "none" ? "" : val)}>
                    <SelectTrigger id="status-select" className="w-full bg-background border-border rounded-xl">
                      <SelectValue placeholder="Aucun statut particulier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun statut particulier</SelectItem>
                      {Array.isArray(courseStatuses) && courseStatuses.map((st) => (
                        <SelectItem key={st.id} value={String(st.id)}>{st.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date & Horaires */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="course-date" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Jour du cours
                    </Label>
                    <Input
                      id="course-date"
                      type="date"
                      required
                      value={courseDate}
                      onChange={(e) => setCourseDate(e.target.value)}
                      className="w-full bg-background border-border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="start-time" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" /> Heure de début
                      </Label>
                      <Input
                        id="start-time"
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-background border-border rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="end-time" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" /> Heure de fin
                      </Label>
                      <Input
                        id="end-time"
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-background border-border rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Récurrence */}
                {(!isEditing || editScope === 'all') && (
                  <div className="pt-2 border-t border-border space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurrent-checkbox"
                        checked={recurrent}
                        onCheckedChange={(checked) => setRecurrent(checked === true)}
                      />
                      <Label htmlFor="recurrent-checkbox" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                        <Repeat className="h-4 w-4 text-primary" />
                        <span>Répéter toutes les semaines</span>
                      </Label>
                    </div>

                    {recurrent && (
                      <div className="space-y-1.5">
                        <Label htmlFor="recurrent-until" className="text-xs font-semibold block text-muted-foreground">
                          Jusqu'au (Date de fin de récurrence)
                        </Label>
                        <Input
                          id="recurrent-until"
                          type="date"
                          required={recurrent}
                          value={recurrentUntil}
                          onChange={(e) => setRecurrentUntil(e.target.value)}
                          className="w-full bg-background border-border rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pied de page (Footer) */}
          <DialogFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4 bg-background/50 sm:justify-between">
            
            {/* Suppression */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirm-delete"
                    checked={confirmDelete}
                    onCheckedChange={(checked) => setConfirmDelete(checked === true)}
                  />
                  <Label htmlFor="confirm-delete" className="text-xs font-medium cursor-pointer text-muted-foreground select-none">
                    Confirmer
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!confirmDelete || deleting || submitting}
                  className="flex items-center gap-1.5 rounded-xl text-sm font-medium cursor-pointer"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span>Supprimer</span>
                </Button>
              </div>
            ) : (
              <div />
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-sm font-medium cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting || loadingOptions || deleting}
                className="flex items-center gap-2 rounded-xl text-sm font-medium cursor-pointer"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {getSubmitButtonText()}
              </Button>
            </div>

          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}