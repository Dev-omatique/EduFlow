'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Calendar, Clock, MapPin, User, BookOpen, GraduationCap, Repeat, Trash2, Tag } from 'lucide-react'

type Grade = { id: number; name: string }
type Subject = { id: number; type: string }
type Teacher = { id: number; firstName: string; lastName: string }
type Room = { id: number; name: string }
type CourseStatus = { id: number; label: string }

interface CourseToEdit {
  id: number | string
  courseId?: number | string // Présent si c'est une instance/exception
  gradeId: number
  subjectId: number
  teacherId: number
  roomId: number
  statusId?: number | null
  startTime: string
  endTime: string
  recurrent?: boolean
  recurrentUntil?: string | null
}

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultGradeId?: number | null
  grades: Grade[]
  initialDate?: string
  initialStartTime?: string
  initialEndTime?: string
  courseToEdit?: CourseToEdit | null
}

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

  // État pour choisir le mode de modification des cours récurrents ('all' ou 'exception')
  const [editScope, setEditScope] = useState<'all' | 'exception'>('all')

  // États de sécurité pour la suppression
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!courseToEdit
  const isRecurrentCourse = isEditing && !!courseToEdit.recurrent

  useEffect(() => {
    if (isOpen) {
      setConfirmDelete(false)
      setEditScope('all') // Réinitialiser au mode par défaut
      if (courseToEdit) {
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
      } else {
        if (defaultGradeId) setGradeId(String(defaultGradeId))
        if (initialDate) setCourseDate(initialDate)
        if (initialStartTime) setStartTime(initialStartTime)
        if (initialEndTime) setEndTime(initialEndTime)
        setStatusId('')
      }
    } else {
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
    }
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

  if (!isOpen) return null

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

      let url = `${API_BASE_URL}/api/courses`
      let method = 'POST'
      let payload: any = {}

      if (isEditing) {
        if (editScope === 'exception') {
          // Création d'une occurrence unique (exception) via l'API course classique
          url = `${API_BASE_URL}/api/courses`
          method = 'POST'
          payload = {
            gradeId: Number(gradeId),
            subjectId: Number(subjectId),
            teacherId: Number(teacherId),
            roomId: Number(roomId),
            statusId: statusId ? Number(statusId) : null,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            recurrent: false,
            recurrentUntil: null,
          }
        } else {
          // Modification de toute la série de cours
          url = `${API_BASE_URL}/api/courses/${courseToEdit.id}`
          method = 'PUT'
          payload = {
            gradeId: Number(gradeId),
            subjectId: Number(subjectId),
            teacherId: Number(teacherId),
            roomId: Number(roomId),
            statusId: statusId ? Number(statusId) : null,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            recurrent,
            recurrentUntil: recurrent && recurrentUntil ? recurrentUntil : null,
          }
        }
      } else {
        // Création classique d'un nouveau cours
        payload = {
          gradeId: Number(gradeId),
          subjectId: Number(subjectId),
          teacherId: Number(teacherId),
          roomId: Number(roomId),
          statusId: statusId ? Number(statusId) : null,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          recurrent,
          recurrentUntil: recurrent && recurrentUntil ? recurrentUntil : null,
        }
      }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl">
        
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{isEditing ? "Modifier le cours" : "Planifier un nouveau cours"}</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                <label className="text-xs font-semibold block text-muted-foreground uppercase tracking-wider">
                  Portée de la modification (Cours récurrent)
                </label>
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
                <div>
                  <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" /> Classe
                  </label>
                  <select
                    required
                    value={gradeId}
                    onChange={(e) => setGradeId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>Sélectionner une classe</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Matière & Enseignant */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="h-4 w-4" /> Matière
                    </label>
                    <select
                      required
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Sélectionner</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-4 w-4" /> Enseignant
                    </label>
                    <select
                      required
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Sélectionner</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salle */}
                <div>
                  <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> Salle
                  </label>
                  <select
                    required
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>Sélectionner une salle</option>
                    {Array.isArray(rooms) && rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Statut du cours (Optionnel) */}
                <div>
                  <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                    <Tag className="h-4 w-4" /> Statut du cours (Optionnel)
                  </label>
                  <select
                    value={statusId}
                    onChange={(e) => setStatusId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Aucun statut particulier</option>
                    {Array.isArray(courseStatuses) && courseStatuses.map((st) => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Horaires */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Jour du cours
                    </label>
                    <input
                      type="date"
                      required
                      value={courseDate}
                      onChange={(e) => setCourseDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" /> Heure de début
                      </label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" /> Heure de fin
                      </label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Récurrence (Affiché uniquement si ce n'est pas une exception isolée) */}
                {(!isEditing || editScope === 'all') && (
                  <div className="pt-2 border-t border-border space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={recurrent}
                        onChange={(e) => setRecurrent(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <Repeat className="h-4 w-4 text-primary" />
                      <span>Répéter toutes les semaines</span>
                    </label>

                    {recurrent && (
                      <div>
                        <label className="text-xs font-semibold mb-1 block text-muted-foreground">
                          Jusqu'au (Date de fin de récurrence)
                        </label>
                        <input
                          type="date"
                          required={recurrent}
                          value={recurrentUntil}
                          onChange={(e) => setRecurrentUntil(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pied de page (Footer) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4 bg-card">
            
            {/* Suppression */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-destructive focus:ring-destructive cursor-pointer"
                  />
                  <span>Confirmer</span>
                </label>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!confirmDelete || deleting || submitting}
                  className="flex items-center gap-1.5 px-3 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span>Supprimer</span>
                </button>
              </div>
            ) : (
              <div />
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || loadingOptions || deleting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? (editScope === 'exception' ? "Créer l'exception" : "Modifier la série") : "Créer le cours"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}