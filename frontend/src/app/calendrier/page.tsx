'use client'

import { useState, useEffect } from 'react'
import { EventApi, ViewApi } from '@fullcalendar/core/index.js'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Loader2 } from 'lucide-react'

// ---- Types alignés sur ton vrai JSON ----

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
  Role: {
    id: number
    role: string // Ex: "STUDENT", "TEACHER"
  }
  Grade?: {
    id: number
    name: string
  }
}

// ---- Helpers API ----

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

async function getCalendarEvents(user: User, startDate: string, endDate: string) {
  console.log("%c[1] getCalendarEvents() appelé", "color: #3b82f6; font-weight: bold;", { user, startDate, endDate })
  
  try {
    let type = ""
    let targetId: number | undefined = undefined

    // Correction de la condition avec tes vraies clés API
    if (user.Role.role === "STUDENT") {
      type = "grade"
      targetId = user.Grade?.id
      console.log("[2] getCalendarEvents - Étudiant détecté. targetId (Grade.id) =", targetId)
    } else {
      // Ajuste "TEACHER" si ton backend utilise un autre mot-clé pour les profs
      type = "teacher"
      targetId = user.id
      console.log("[2] getCalendarEvents - Enseignant détecté. targetId (user.id) =", targetId)
    }

    if (!targetId) {
      console.warn("[⚠️ WARNING] getCalendarEvents - Impossible de trouver un targetId valide. Fin de la requête.")
      return []
    }

    console.log(type)
    console.log(targetId)
    const url = `${API_BASE_URL}/api/courses/${type}/${targetId}?startDate=${startDate}&endDate=${endDate}`
    console.log("[3] getCalendarEvents - URL finale :", url)
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    console.log("[4] getCalendarEvents - Statut HTTP :", response.status)

    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`)

    const courses: CourseBackend[] = await response.json()
    console.log("[5] getCalendarEvents - Data brute reçue :", courses)

    const mappedEvents = courses.map(course => ({
      id: String(course.id),
      title: course.Subject?.type || "Cours", 
      start: course.startTime,
      end: course.endTime,
      className: "event-class-custom",
      extendedProps: {
        professor: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "Non spécifié",
        room: course.Room?.name || "Sans salle"
      }
    }))

    console.log("[6] getCalendarEvents - Data formatée pour FullCalendar :", mappedEvents)
    return mappedEvents

  } catch (error) {
    console.error("[❌ ERROR] getCalendarEvents - Échec :", error)
    return []
  }
}

// ---- Composant Principal ----

export default function Calendar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  console.log("%c[Render] Composant Calendar", "color: #10b981;", { user, loading })

  useEffect(() => {
    async function loadUser() {
      try {
        const urlMe = `${API_BASE_URL}/api/users/me`
        console.log("[useEffect] Chargement utilisateur via :", urlMe)

        const response = await fetch(urlMe, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const resData = await response.json()
          // Si ton API renvoie directement l'objet utilisateur ou un objet { user: ... }
          const userData = resData.user ? resData.user : resData
          console.log("[useEffect] Données utilisateur injectées dans le state :", userData)
          setUser(userData)
        } else {
          console.error("[useEffect] Erreur de session, statut :", response.status)
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
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600 border border-red-100">
        <p className="font-medium">Accès refusé</p>
        <p className="text-sm">Veuillez vous connecter pour voir votre emploi du temps.</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        locale="fr"
        weekends={false}
        allDaySlot={false}
        
        events={async (fetchInfo, successCallback, failureCallback) => {
          console.log("%c[FullCalendar] Demande de rafraîchissement des événements", "color: #eab308; font-weight: bold;")
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

// ---- Custom Render pour les événements ----

function renderEventContent(eventInfo: {
  event: EventApi
  timeText: string
  view: ViewApi
}) {
  const { professor, room } = eventInfo.event.extendedProps as {
    professor: string
    room: string
  }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-1 text-xs leading-tight overflow-hidden h-full text-white bg-primary rounded-lg border-l-4 border-primary-dark">
      <span className="font-bold truncate">{eventInfo.event.title}</span>
      {professor && <span className="opacity-90 truncate text-[11px]">{professor}</span>}
      {room      && <span className="opacity-95 font-medium truncate text-[11px]">{room}</span>}
      <span className="opacity-70 text-[10px] mt-auto font-mono">{eventInfo.timeText}</span>
    </div>
  )
}