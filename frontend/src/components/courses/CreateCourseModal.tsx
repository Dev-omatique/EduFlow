'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Calendar, Clock, MapPin, User, BookOpen, GraduationCap, Repeat } from 'lucide-react'

type Grade = { id: number; name: string }
type Subject = { id: number; type: string }
type Teacher = { id: number; firstName: string; lastName: string }
type Room = { id: number; name: string }

interface CreateCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultGradeId?: number | null
  grades: Grade[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSuccess,
  defaultGradeId,
  grades,
}: CreateCourseModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const [gradeId, setGradeId] = useState<string>('')
  const [subjectId, setSubjectId] = useState<string>('')
  const [teacherId, setTeacherId] = useState<string>('')
  const [roomId, setRoomId] = useState<string>('')

  // 3 états distincts pour le jour et les horaires
  const [courseDate, setCourseDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')

  const [recurrent, setRecurrent] = useState<boolean>(false)
  const [recurrentUntil, setRecurrentUntil] = useState<string>('')

  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (defaultGradeId) {
      setGradeId(String(defaultGradeId))
    }
  }, [defaultGradeId])

  useEffect(() => {
    if (!isOpen) return

    async function fetchOptions() {
      setLoadingOptions(true)
      setError(null)
      try {
        const [resSubjects, resTeachers, resRooms] = await Promise.all([
          fetch(`${API_BASE_URL}/api/subjects`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/users/role/4`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/rooms`, { credentials: 'include' }),
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

    // Vérification que l'heure de fin est bien après l'heure de début
    if (startTime >= endTime) {
      setError("L'heure de fin doit être supérieure à l'heure de début.")
      setSubmitting(false)
      return
    }

    try {
      // Reconstitution des objets Date complets à partir de la date + heure
      const startDateTime = new Date(`${courseDate}T${startTime}`)
      const endDateTime = new Date(`${courseDate}T${endTime}`)

      const payload = {
        gradeId: Number(gradeId),
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        roomId: Number(roomId),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        recurrent,
        recurrentUntil: recurrent && recurrentUntil ? recurrentUntil : null,
      }

      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "Impossible de créer le cours")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl">
        
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Planifier un nouveau cours</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              {error}
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

              {/* Date & Horaires (Séparés) */}
              <div className="space-y-3 pt-1">
                {/* Jour */}
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

                {/* Heures : Début & Fin */}
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

              {/* Récurrence */}
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
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || loadingOptions}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Créer le cours
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}