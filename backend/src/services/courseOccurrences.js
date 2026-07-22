import { Op } from 'sequelize';
import db from '../models/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export const ALLOWED_TAGS = ['annule', 'modifie', 'deplace'];

/**
 * Renvoie la clé "YYYY-MM-DD" d'une date. Utilisée pour identifier de façon
 * stable une occurrence précise d'une série récurrente (courseId + date).
 */
export const dateKey = (date) => new Date(date).toISOString().slice(0, 10);

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

/**
 * Construit l'objet "occurrence" exposé à l'API (calendrier), en appliquant
 * l'éventuelle exception (annulation / modification / déplacement) trouvée
 * pour cette date précise de la série.
 */
const buildOccurrence = (course, baseStart, baseEnd, exception) => {
  const status = exception?.status ?? null;
  const start = exception?.startTime ? new Date(exception.startTime) : baseStart;
  const end = exception?.endTime ? new Date(exception.endTime) : baseEnd;

  return {
    // Id unique par occurrence pour le calendrier (FullCalendar) :
    // une simple série non récurrente garde l'id du cours, une occurrence
    // récurrente est préfixée par la date pour rester unique.
    id: course.recurrent ? `${course.id}_${dateKey(baseStart)}` : String(course.id),
    courseId: course.id,
    occurrenceDate: dateKey(baseStart),
    recurrent: !!course.recurrent,
    recurrentUntil: course.recurrentUntil,
    exceptionId: exception?.id ?? null,
    tag: status ?? course.tag ?? null,
    note: exception?.note ?? null,
    startTime: start,
    endTime: end,
    roomId: exception?.roomId ?? course.roomId,
    subjectId: course.subjectId,
    teacherId: exception?.teacherId ?? course.teacherId,
    gradeId: course.gradeId,
    teacher: exception?.teacher ?? course.teacher,
    Room: exception?.Room ?? course.Room,
    Grade: course.Grade,
    Subject: course.Subject,
  };
};

/**
 * Étend les cours (uniques ou récurrents) correspondant à `where` en occurrences
 * concrètes sur la période [rangeStart, rangeEnd], en appliquant les exceptions
 * (course_exceptions) trouvées pour chaque occurrence.
 *
 * Les occurrences annulées restent présentes dans le résultat (tag "annule")
 * plutôt que d'être supprimées : c'est à l'appelant de décider de les afficher
 * différemment (calendrier) ou de les ignorer (vérification de conflit).
 */
export async function expandOccurrences({ where, rangeStart, rangeEnd }) {
  const { Course, CourseException, User, Room, Subject, Grade } = db;
  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);

  const courses = await Course.findAll({
    where: {
      ...where,
      [Op.or]: [
        // Cours ponctuel qui chevauche la période demandée
        {
          recurrent: false,
          startTime: { [Op.lt]: end },
          endTime: { [Op.gt]: start },
        },
        // Série récurrente encore active sur (une partie de) la période
        {
          recurrent: true,
          startTime: { [Op.lte]: end },
          [Op.or]: [
            { recurrentUntil: null },
            { recurrentUntil: { [Op.gte]: start } },
          ],
        },
      ],
    },
    include: [
      { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
      { model: Room, attributes: ['id', 'name'] },
      { model: Grade, attributes: ['id', 'name'] },
      { model: Subject, attributes: ['id', 'type'] },
    ],
  });

  if (courses.length === 0) return [];

  const exceptions = await CourseException.findAll({
    where: {
      courseId: courses.map((c) => c.id),
      date: { [Op.gte]: dateKey(start), [Op.lte]: dateKey(end) },
    },
    include: [
      { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
      { model: Room, attributes: ['id', 'name'] },
    ],
  });

  const exceptionMap = new Map(exceptions.map((ex) => [`${ex.courseId}_${ex.date}`, ex]));

  const occurrences = [];

  for (const course of courses) {
    if (!course.recurrent) {
      const baseStart = new Date(course.startTime);
      const baseEnd = new Date(course.endTime);
      const exception = exceptionMap.get(`${course.id}_${dateKey(baseStart)}`);
      occurrences.push(buildOccurrence(course, baseStart, baseEnd, exception));
      continue;
    }

    const durationMs = new Date(course.endTime).getTime() - new Date(course.startTime).getTime();
    const seriesStart = new Date(course.startTime);
    const seriesEnd = course.recurrentUntil
      ? new Date(`${course.recurrentUntil}T23:59:59`)
      : end;

    // Aligne le curseur sur la première occurrence >= rangeStart tout en
    // respectant la cadence hebdomadaire fixée par le premier cours de la série.
    let cursor = new Date(seriesStart);
    if (cursor < start) {
      const weeksElapsed = Math.floor((startOfDay(start) - startOfDay(cursor)) / WEEK_MS);
      if (weeksElapsed > 0) cursor = new Date(cursor.getTime() + weeksElapsed * WEEK_MS);
      while (cursor < start) cursor = new Date(cursor.getTime() + WEEK_MS);
    }

    while (cursor <= end && cursor <= seriesEnd) {
      const occStart = new Date(cursor);
      const occEnd = new Date(cursor.getTime() + durationMs);
      const exception = exceptionMap.get(`${course.id}_${dateKey(occStart)}`);
      occurrences.push(buildOccurrence(course, occStart, occEnd, exception));
      cursor = new Date(cursor.getTime() + WEEK_MS);
    }
  }

  return occurrences;
}

/**
 * Vérifie si le créneau [start, end) pour une classe donnée entre en conflit
 * avec une occurrence déjà planifiée (cours ponctuel ou occurrence d'une série
 * récurrente), en tenant compte des exceptions (une occurrence annulée libère
 * le créneau).
 *
 * - excludeCourseId : ignore ce cours (utile lors d'une mise à jour de série)
 * - excludeDate : en plus de excludeCourseId, n'ignore que l'occurrence de
 *   cette date précise (utile lors de la modification d'une seule occurrence)
 */
export async function hasGradeConflict({ gradeId, start, end, excludeCourseId, excludeDate }) {
  const rangeStart = startOfDay(start);
  const rangeEnd = new Date(startOfDay(end).getTime() + DAY_MS);

  const occurrences = await expandOccurrences({
    where: { gradeId },
    rangeStart,
    rangeEnd,
  });

  return occurrences.some((occ) => {
    if (occ.tag === 'annule') return false;

    if (excludeCourseId && occ.courseId === Number(excludeCourseId)) {
      if (!excludeDate || occ.occurrenceDate === excludeDate) return false;
    }

    return overlaps(new Date(occ.startTime), new Date(occ.endTime), start, end);
  });
}
