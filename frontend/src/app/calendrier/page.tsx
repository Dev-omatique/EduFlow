'use client'

import "../style/calendar.css"

import { useState, useEffect, useRef } from 'react'
import { EventApi } from '@fullcalendar/core/index.js'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Loader2, ShieldAlert, GraduationCap, Plus } from 'lucide-react'
import Sidebar from "@/components/layout/Sidebar"
import CreateCourseModal from "@/components/courses/CreateCourseModal"

type CourseBackend = {
  id: number
  startTime: string
  endTime: string
  teacher?: { firstName: string; lastName: string }
  Room?: { name: string }
  Subject?: { type: string }
  Grade?: { name: string }
}

type Grade = {
  id: number
  name: string
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

async function getCalendarEvents(
  user: User, 
  startDate: string, 
  endDate: string, 
  selectedGradeId?: number | null
) {
  try {
    const isVieScolaire = user.Role.id === 14 || user.Role.role === "VIE_SCOLAIRE"
    let url = ""

    if (isVieScolaire) {
      if (!selectedGradeId) return []
      url = `${API_BASE_URL}/api/courses/grade/${selectedGradeId}?startDate=${startDate}&endDate=${endDate}`
    } else {
      const type = user.Role.role === "STUDENT" ? "grade" : "teacher"
      const targetId = user.Role.role === "STUDENT" ? user.Grade?.id : user.id

      if (!targetId) return []
      url = `${API_BASE_URL}/api/courses/${type}/${targetId}?startDate=${startDate}&endDate=${endDate}`
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)

    const courses: CourseBackend[] = await response.json()

    return courses.map(course => {
      const participantInfo = (user.Role.role === "STUDENT" || isVieScolaire)
        ? (course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "Non spécifié")
        : (course.Grade?.name || "Classe non spécifiée");

      return {
        id: String(course.id),
        title: course.Subject?.type || "Cours", 
        start: course.startTime,
        end: course.endTime,
        extendedProps: {
          participant: participantInfo,
          room: course.Room?.name || "Sans salle"
        }
      }
    })
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return []
  }
}

export default function Calendar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [calendarView, setCalendarView] = useState<'timeGridWeek' | 'timeGridDay'>('timeGridWeek')
  
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    const handleResize = () => {
      setCalendarView(window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek')
    }

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
          const currentUser: User = resData.user ? resData.user : resData
          setUser(currentUser)

          if (currentUser.Role.id === 14 || currentUser.Role.role === "VIE_SCOLAIRE") {
            const resGrades = await fetch(`${API_BASE_URL}/api/grades`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            })

            if (resGrades.ok) {
              const gradesData: Grade[] = await resGrades.json()
              setGrades(gradesData)
              if (gradesData.length > 0) {
                setSelectedGradeId(gradesData[0].id)
              }
            }
          }
        }
      } catch (error) {
        console.error("loadUser error:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents()
    }
  }, [selectedGradeId])

  const handleCourseCreated = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents()
    }
  }

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

  const isVieScolaire = user.Role.id === 14 || user.Role.role === "VIE_SCOLAIRE"

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="w-full px-4 py-6 pt-20 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:p-6">
        
        {isVieScolaire && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>Consulter l'emploi du temps d'une classe :</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedGradeId ?? ''}
                onChange={(e) => setSelectedGradeId(Number(e.target.value))}
                className="px-3 py-2 bg-background border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer max-w-xs"
              >
                {grades.length === 0 ? (
                  <option value="" disabled>Aucune classe disponible</option>
                ) : (
                  grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Créer</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-3 md:p-5 bg-card rounded-2xl border border-border shadow-sm text-foreground custom-fullcalendar h-[85vh] md:h-[95vh]">
          <FullCalendar
            ref={calendarRef}
            key={calendarView}
            plugins={[timeGridPlugin]}
            initialView={calendarView}
            slotMinTime="08:00:00"
            slotMaxTime="19:00:00"
            locale="fr"
            height="100%"
            weekends={false}
            allDaySlot={false}
            buttonText={{
              today: "Aujourd'hui"
            }}
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'prev,next today'
            }}
            dayHeaderFormat={
              calendarView === 'timeGridDay' 
                ? { weekday: 'long', day: 'numeric', month: 'long' } 
                : { weekday: 'short', day: 'numeric' }
            }
            events={async (fetchInfo, successCallback, failureCallback) => {
              try {
                const start = fetchInfo.startStr.split('T')[0]
                const end = fetchInfo.endStr.split('T')[0]
                const events = await getCalendarEvents(user, start, end, selectedGradeId)
                successCallback(events)
              } catch (error) {
                failureCallback(error as Error)
              }
            }}
            eventContent={renderEventContent}
          />
        </div>
      </main>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCourseCreated}
        defaultGradeId={selectedGradeId}
        grades={grades}
      />
    </div>
  )
}

function renderEventContent(eventInfo: { event: EventApi; timeText: string }) {
  const { participant, room } = eventInfo.event.extendedProps as { participant: string; room: string }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-1 md:px-2.5 md:py-1.5 h-full w-full bg-primary-light dark:bg-primary-light/10 text-primary-hover dark:text-primary rounded-md border-l-[4px] border-primary shadow-xs overflow-hidden select-none">
      <span className="font-semibold text-[12px] md:text-[13px] tracking-tight leading-snug text-slate-900 dark:text-slate-100 truncate">
        {eventInfo.event.title}
      </span>
      
      {participant && (
        <span className="text-[10px] md:text-[11px] font-medium opacity-85 text-slate-700 dark:text-slate-300 truncate">
          {participant}
        </span>
      )}
      
      {room && (
        <span className="text-[10px] md:text-[11px] font-semibold opacity-90 text-slate-600 dark:text-slate-400 mt-0.5 truncate">
          {room}
        </span>
      )}
      
      <span className="text-[9px] md:text-[10px] font-mono opacity-75 mt-auto pt-1 text-slate-500 dark:text-slate-400">
        {eventInfo.timeText}
      </span>
    </div>
  )
}