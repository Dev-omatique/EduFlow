'use client'

import "../style/calendar.css";

import { useState, useEffect } from 'react'
import { EventApi } from '@fullcalendar/core/index.js'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Loader2, ShieldAlert } from 'lucide-react'

// ---- Types ----
type CourseBackend = {
  id: number
  startTime: string
  endTime: string
  teacher?: { firstName: string; lastName: string }
  Room?: { name: string }
  Subject?: { type: string }
}

type User = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  Role: { id: number; role: string }
  Grade?: { id: number; name: string }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

async function getCalendarEvents(user: User, startDate: string, endDate: string) {
  try {
    let type = user.Role.role === "STUDENT" ? "grade" : "teacher"
    let targetId = user.Role.role === "STUDENT" ? user.Grade?.id : user.id

    if (!targetId) return []

    const url = `${API_BASE_URL}/api/courses/${type}/${targetId}?startDate=${startDate}&endDate=${endDate}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`)

    const courses: CourseBackend[] = await response.json()

    return courses.map(course => ({
      id: String(course.id),
      title: course.Subject?.type || "Cours", 
      start: course.startTime,
      end: course.endTime,
      extendedProps: {
        professor: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "Non spécifié",
        room: course.Room?.name || "Sans salle"
      }
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des événements :", error)
    return []
  }
}

export default function Calendar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // État pour gérer la vue responsive (Semaine par défaut)
  const [calendarView, setCalendarView] = useState<'timeGridWeek' | 'timeGridDay'>('timeGridWeek')

  // Détection de la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCalendarView('timeGridDay') // Mode jour sur mobile
      } else {
        setCalendarView('timeGridWeek') // Mode semaine sur tablette/ordinateur
      }
    }

    // Exécution initiale au montage
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadUser() {
      try {
        const urlMe = `${API_BASE_URL}/api/users/me`
        const response = await fetch(urlMe, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const resData = await response.json()
          setUser(resData.user ? resData.user : resData)
        }
      } catch (error) {
        console.error("[❌ ERROR] loadUser :", error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[65vh] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Chargement de votre emploi du temps...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive max-w-md mx-auto my-12">
        <ShieldAlert className="h-10 w-10 mb-3 opacity-90" />
        <h3 className="font-semibold text-lg">Accès refusé</h3>
        <p className="text-sm opacity-80 mt-1">Veuillez vous connecter pour consulter vos cours planifiés.</p>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-5 bg-card rounded-2xl border border-border shadow-sm text-foreground custom-fullcalendar h-[85vh] md:h-[95vh]">
      <FullCalendar
        key={calendarView} // Crucial : force le re-rendu de FullCalendar quand la vue change
        plugins={[timeGridPlugin]}
        initialView={calendarView}
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        locale="fr"
        height="100%"
        weekends={false}
        allDaySlot={false}
        headerToolbar={{
          left: 'title',
          center: '',
          right: 'prev,next today'
        }}
        dayHeaderFormat={
          calendarView === 'timeGridDay' 
            ? { weekday: 'long', day: 'numeric', month: 'long' } // Format plus complet si on est tout seul sur l'écran
            : { weekday: 'short', day: 'numeric' }
        }
        events={async (fetchInfo, successCallback, failureCallback) => {
          try {
            const start = fetchInfo.startStr.split('T')[0]
            const end = fetchInfo.endStr.split('T')[0]
            const events = await getCalendarEvents(user, start, end)
            successCallback(events)
          } catch (error) {
            failureCallback(error as Error)
          }
        }}
        eventContent={renderEventContent}
      />
    </div>
  )
}

// ---- Rendu Visuel des Événements (Style Shadcn / Tinted Soft) ----

function renderEventContent(eventInfo: { event: EventApi; timeText: string }) {
  const { professor, room } = eventInfo.event.extendedProps as { professor: string; room: string }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-1 md:px-2.5 md:py-1.5 h-full w-full bg-primary-light dark:bg-primary-light/10 text-primary-hover dark:text-primary rounded-md border-l-[4px] border-primary shadow-xs overflow-hidden select-none">
      {/* Titre du cours */}
      <span className="font-semibold text-[12px] md:text-[13px] tracking-tight leading-snug text-slate-900 dark:text-slate-100 truncate">
        {eventInfo.event.title}
      </span>
      
      {/* Professeur */}
      {professor && (
        <span className="text-[10px] md:text-[11px] font-medium opacity-85 text-slate-700 dark:text-slate-300 truncate">
          {professor}
        </span>
      )}
      
      {/* Salle de classe */}
      {room && (
        <span className="text-[10px] md:text-[11px] font-semibold opacity-90 text-slate-600 dark:text-slate-400 mt-0.5 truncate">
          {room}
        </span>
      )}
      
      {/* Horaire en bas */}
      <span className="text-[9px] md:text-[10px] font-mono opacity-75 mt-auto pt-1 text-slate-500 dark:text-slate-400">
        {eventInfo.timeText}
      </span>
    </div>
  )
}