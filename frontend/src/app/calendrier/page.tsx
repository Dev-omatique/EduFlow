'use client'

import "../style/calendar.css"

import { useState, useEffect, useRef } from 'react'
import { EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Loader2, ShieldAlert, GraduationCap, Plus } from 'lucide-react'
import Sidebar from "@/components/layout/Sidebar"
import CreateCourseModal from "@/components/courses/CourseModal"
import CourseDetailsModal, { CourseDetails } from "@/components/courses/CourseDetailsModal"

type CourseBackend = {
  id: number | string
  startTime: string
  endTime: string
  gradeId: number
  subjectId: number
  teacherId: number
  roomId: number
  statusId?: number | null
  recurrent?: boolean
  recurrentUntil?: string
  teacher?: { firstName: string; lastName: string }
  Room?: { name: string }
  Subject?: { type: string }
  Grade?: { name: string }
  status?: { id: number; label: string }
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

      const rawId = String(course.id);
      const baseId = rawId.includes('_') ? rawId.split('_')[0] : rawId;
      const statusLabel = course.status?.label || null;

      return {
        id: rawId,
        title: course.Subject?.type || "Cours", 
        start: course.startTime,
        end: course.endTime,
        extendedProps: {
          participant: participantInfo,
          room: course.Room?.name || "Sans salle",
          statusLabel: statusLabel,
          statusId: course.statusId ?? null,
          courseId: baseId,
          gradeId: course.gradeId,
          subjectId: course.subjectId,
          teacherId: course.teacherId,
          roomId: course.roomId,
          recurrent: course.recurrent,
          recurrentUntil: course.recurrentUntil,
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
  
  // États pour la création / modification (Vie Scolaire)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedStartTime, setSelectedStartTime] = useState<string>('')
  const [selectedEndTime, setSelectedEndTime] = useState<string>('')
  const [selectedCourseToEdit, setSelectedCourseToEdit] = useState<any | null>(null)

  // États pour la popup de consultation (Élèves / Professeurs)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCourseToView, setSelectedCourseToView] = useState<CourseDetails | null>(null)

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

  const handleCourseSaved = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents()
    }
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const startDateStr = selectInfo.startStr.split('T')[0]
    
    if (selectInfo.startStr.includes('T')) {
      const startTimeStr = selectInfo.startStr.split('T')[1].substring(0, 5)
      const endTimeStr = selectInfo.endStr.split('T')[1].substring(0, 5)
      
      setSelectedCourseToEdit(null)
      setSelectedDate(startDateStr)
      setSelectedStartTime(startTimeStr)
      setSelectedEndTime(endTimeStr)
      setIsModalOpen(true)
    }

    selectInfo.view.calendar.unselect()
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const isVieScolaire = user?.Role.id === 14 || user?.Role.role === "VIE_SCOLAIRE"
    const props = clickInfo.event.extendedProps

    if (isVieScolaire) {
      setSelectedCourseToEdit({
        id: props.courseId,
        gradeId: props.gradeId,
        subjectId: props.subjectId,
        teacherId: props.teacherId,
        roomId: props.roomId,
        statusId: props.statusId,
        startTime: clickInfo.event.startStr,
        endTime: clickInfo.event.endStr,
        recurrent: props.recurrent,
        recurrentUntil: props.recurrentUntil,
      })
      setIsModalOpen(true)
    } else {
      setSelectedCourseToView({
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        participant: props.participant,
        room: props.room,
        statusLabel: props.statusLabel,
        recurrent: props.recurrent,
        recurrentUntil: props.recurrentUntil,
      })
      setIsViewModalOpen(true)
    }
  }

  const openModalManually = () => {
    setSelectedCourseToEdit(null)
    setSelectedDate('')
    setSelectedStartTime('')
    setSelectedEndTime('')
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Chargement de votre emploi du temps...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-destructive/25 bg-destructive/5 text-destructive max-w-md">
          <ShieldAlert className="h-10 w-10 mb-3 opacity-90" />
          <h3 className="font-semibold text-lg">Accès refusé</h3>
          <p className="text-sm opacity-80 mt-1">Veuillez vous connecter pour consulter vos cours planifiés.</p>
        </div>
      </div>
    )
  }

  const isVieScolaire = user.Role.id === 14 || user.Role.role === "VIE_SCOLAIRE"

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full lg:pl-[250px] overflow-hidden">
        <div className="flex-1 flex flex-col p-4 lg:p-6 pt-20 lg:pt-6 gap-4 min-h-0 overflow-hidden">
          
          {isVieScolaire && (
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card rounded-2xl border border-border shadow-xs">
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
                  onClick={openModalManually}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Créer</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 p-3 md:p-5 bg-card rounded-2xl border border-border shadow-sm text-foreground custom-fullcalendar flex flex-col">
            <FullCalendar
              ref={calendarRef}
              key={calendarView}
              plugins={[timeGridPlugin, interactionPlugin]}
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
              
              selectable={isVieScolaire}
              selectMirror={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              
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
        </div>
      </main>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCourseSaved}
        defaultGradeId={selectedGradeId}
        grades={grades}
        initialDate={selectedDate}
        initialStartTime={selectedStartTime}
        initialEndTime={selectedEndTime}
        courseToEdit={selectedCourseToEdit}
      />

      {isViewModalOpen && selectedCourseToView && (
        <CourseDetailsModal 
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          course={selectedCourseToView}
          userRole={user.Role.role}
        />
      )}
    </div>
  )
}

function renderEventContent(eventInfo: { event: EventApi; timeText: string }) {
  const { participant, room, statusLabel } = eventInfo.event.extendedProps as { 
    participant?: string; 
    room: string; 
    statusLabel?: string | null 
  }

  const start = eventInfo.event.start
  const end = eventInfo.event.end
  const durationMinutes = start && end ? (end.getTime() - start.getTime()) / (1000 * 60) : 60
  const isShortEvent = durationMinutes <= 30

  if (isShortEvent) {
    return (
      <div 
        title={`${eventInfo.event.title} - ${room} ${statusLabel ? `(${statusLabel})` : ''}`}
        className="flex items-center justify-between h-full w-full bg-primary-light dark:bg-primary-light/10 text-primary-hover dark:text-primary px-1.5 rounded-md border-l-[3px] border-primary shadow-2xs overflow-hidden text-[11px] select-none cursor-pointer gap-1"
      >
        <div className="flex items-center gap-1 truncate">
          <span className="font-semibold truncate">{eventInfo.event.title}</span>
          {room && <span className="opacity-80 text-[10px] truncate">({room})</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {statusLabel && (
            <span className="text-[8px] bg-amber-500 text-white px-1 py-0.5 rounded font-bold uppercase">
              {statusLabel}
            </span>
          )}
          <span className="text-[9px] font-mono opacity-75">{eventInfo.timeText}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-primary-light dark:bg-primary-light/10 text-primary-hover dark:text-primary rounded-md border-l-[4px] border-primary shadow-xs overflow-hidden select-none cursor-pointer relative">
      
      {statusLabel && (
        <div className="w-full bg-amber-500 text-white dark:bg-amber-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-center shrink-0">
          {statusLabel}
        </div>
      )}

      <div className="flex flex-col gap-0.5 px-2 py-1 flex-1 justify-between min-h-0">
        <div className="overflow-hidden">
          <span className="font-semibold text-[11px] md:text-[12px] tracking-tight leading-tight text-slate-900 dark:text-slate-100 truncate block">
            {eventInfo.event.title}
          </span>
          
          {participant && (
            <span className="text-[10px] font-medium opacity-75 text-slate-700 dark:text-slate-300 truncate block mt-0.5">
              {participant}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <span className="text-[10px] font-semibold opacity-90 text-slate-600 dark:text-slate-400 truncate">
            {room || "Sans salle"}
          </span>
          <span className="text-[9px] font-mono opacity-75 text-slate-500 dark:text-slate-400 shrink-0">
            {eventInfo.timeText}
          </span>
        </div>
      </div>
    </div>
  )
}