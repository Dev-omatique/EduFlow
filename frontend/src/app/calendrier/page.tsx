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
import { getPastelHex } from '@/utils/color'

// Importation des composants Shadcn UI
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
  Subject?: { type: string; color?: string }
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
          subjectColor: course.Subject?.color || null,
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
  const [selectedCourseToEdit, setSelectedCourseToEdit] = useState<CourseBackend | null>(null)

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
      } as CourseBackend)
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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Card className="flex flex-col items-center justify-center p-8 border-none shadow-none bg-transparent gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Chargement de votre emploi du temps...
          </p>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive/30 bg-destructive/5 text-center p-2">
          <CardHeader className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-2">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl text-destructive">Accès refusé</CardTitle>
            <CardDescription className="text-destructive/80">
              Veuillez vous connecter pour consulter vos cours planifiés.
            </CardDescription>
          </CardHeader>
        </Card>
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
            <Card className="shrink-0 p-4 border-border shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>Consulter l'emploi du temps d'une classe :</span>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedGradeId ? String(selectedGradeId) : undefined}
                    onValueChange={(value) => setSelectedGradeId(Number(value))}
                    disabled={grades.length === 0}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={grades.length === 0 ? "Aucune classe" : "Sélectionner une classe"} />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={String(grade.id)}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    onClick={openModalManually}
                    className="gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Créer</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className="flex-1 min-h-0 p-3 md:p-5 shadow-xs border-border custom-fullcalendar flex flex-col overflow-hidden">
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
          </Card>
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
  const { participant, room, statusLabel, subjectColor } = eventInfo.event.extendedProps as { 
    participant?: string; 
    room: string; 
    statusLabel?: string | null;
    subjectColor?: string | null;
  }

  const start = eventInfo.event.start
  const end = eventInfo.event.end
  const durationMinutes = start && end ? (end.getTime() - start.getTime()) / (1000 * 60) : 60
  const isShortEvent = durationMinutes <= 30

  // Style dynamique aux couleurs de la matière
  const dynamicStyle = subjectColor ? {
    borderLeftColor: subjectColor,
    backgroundColor: getPastelHex(subjectColor, 0.85),
  } : {}

  const statusStyle = subjectColor ? {
    borderBottom: `3px solid ${subjectColor}`,
  } : {}

  const statusSuffix = statusLabel ? ` (${statusLabel})` : ''
  const tooltipTitle = `${eventInfo.event.title} - ${room}${statusSuffix}`

  if (isShortEvent) {
    return (
      <div 
        title={tooltipTitle}
        style={dynamicStyle}
        className="flex items-center justify-between h-full w-full text-foreground px-1.5 rounded-md border-l-[3px] shadow-2xs overflow-hidden text-[11px] select-none cursor-pointer gap-1"
      >
        <div className="flex items-center gap-1 truncate">
          <span className="font-semibold truncate">{eventInfo.event.title}</span>
          {room && <span className="opacity-80 text-[10px] truncate">({room})</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {statusLabel && (
            <Badge 
              variant="outline"
              style={statusStyle}
              className="text-[8px] bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 px-1 py-0 h-4 font-bold uppercase rounded-xs shrink-0"
            >
              {statusLabel}
            </Badge>
          )}
          <span className="text-[9px] font-mono opacity-75">{eventInfo.timeText}</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      style={dynamicStyle}
      className="flex flex-col h-full w-full text-foreground rounded-md border-l-[4px] shadow-xs overflow-hidden select-none cursor-pointer relative"
    >
      {statusLabel && (
        <div 
          style={statusStyle}
          className="w-full bg-amber-100/90 text-amber-950 dark:bg-amber-950/90 dark:text-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-center shrink-0 border-b border-amber-200/50"
        >
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