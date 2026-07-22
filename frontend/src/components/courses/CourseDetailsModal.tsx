'use client'

import { X, Calendar as CalendarIcon, Clock, MapPin, User as UserIcon, AlertCircle } from 'lucide-react'

export type CourseDetails = {
  readonly title: string
  readonly start: string
  readonly end: string
  readonly participant: string
  readonly room: string
  readonly statusLabel?: string | null
  readonly recurrent?: boolean
  readonly recurrentUntil?: string
}

type CourseDetailsModalProps = Readonly<{
  isOpen: boolean
  onClose: () => void
  course: CourseDetails
  userRole: string
}>

export default function CourseDetailsModal({ 
  isOpen, 
  onClose, 
  course, 
  userRole 
}: CourseDetailsModalProps) {
  if (!isOpen) return null

  const startDate = new Date(course.start)
  const endDate = new Date(course.end)

  const formattedDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const formattedStartTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const formattedEndTime = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const isStudent = userRole === "STUDENT"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border text-foreground rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-lg">Détails du cours</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 flex flex-col gap-4">
          
          {course.statusLabel && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold uppercase tracking-wider">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Statut : {course.statusLabel}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Matière</span>
            <span className="text-xl font-bold text-foreground">{course.title}</span>
          </div>

          <hr className="border-border/60" />

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium capitalize text-foreground">{formattedDate}</p>
                <p className="text-muted-foreground text-xs mt-0.5">De {formattedStartTime} à {formattedEndTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Salle</p>
                <p className="font-medium text-foreground">{course.room || "Non spécifiée"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">{isStudent ? "Enseignant" : "Classe"}</p>
                <p className="font-medium text-foreground">{course.participant || "Non spécifié"}</p>
              </div>
            </div>
          </div>

          {course.recurrent && (
            <div className="mt-2 text-xs bg-muted/50 p-3 rounded-xl border border-border text-muted-foreground">
              🔄 Ce cours est récurrent {course.recurrentUntil ? `jusqu'au ${new Date(course.recurrentUntil).toLocaleDateString('fr-FR')}` : ''}.
            </div>
          )}

        </div>

        {/* Pied */}
        <div className="px-6 py-4 border-t border-border bg-background/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  )
}