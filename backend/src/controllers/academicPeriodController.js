import db from '../models/index.js';

const { AcademicPeriod, Exam, Note, User, Roles, ParentStudent } = db;
const periodLimits = { TRIMESTER: 3, SEMESTER: 2 };

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime())
    && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function toDateOnly(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function validatePeriod(body) {
  const periodType = String(body.periodType || '').toUpperCase();
  const number = Number(body.number);
  const schoolYear = String(body.schoolYear || '').trim();
  const startDate = body.startDate || null;
  const endDate = body.endDate || null;

  if (!periodLimits[periodType]) {
    return { error: 'Le type doit être TRIMESTER ou SEMESTER.' };
  }
  if (!Number.isInteger(number) || number < 1 || number > periodLimits[periodType]) {
    return { error: `Le numéro doit être compris entre 1 et ${periodLimits[periodType]}.` };
  }
  const schoolYearMatch = /^(\d{4})-(\d{4})$/.exec(schoolYear);
  if (!schoolYearMatch || Number(schoolYearMatch[2]) !== Number(schoolYearMatch[1]) + 1) {
    return { error: 'L’année scolaire doit être au format AAAA-AAAA.' };
  }
  if ((startDate && !isValidDate(startDate)) || (endDate && !isValidDate(endDate))) {
    return { error: 'Les dates de période doivent être des dates valides.' };
  }
  if (startDate && endDate && startDate > endDate) {
    return { error: 'La date de début doit précéder la date de fin.' };
  }

  const typeLabel = periodType === 'TRIMESTER' ? 'Trimestre' : 'Semestre';
  return {
    value: {
      label: String(body.label || `${typeLabel} ${number}`).trim(),
      periodType,
      number,
      schoolYear,
      startDate,
      endDate,
    },
  };
}

async function hasConflictingPeriodScheme(schoolYear, periodType, excludeId) {
  const periods = await AcademicPeriod.findAll({
    where: { schoolYear },
    attributes: ['id', 'periodType'],
  });
  return periods.some((period) => period.id !== excludeId && period.periodType !== periodType);
}

async function hasExamsOutsidePeriod(periodId, value) {
  const exams = await Exam.findAll({
    where: { academicPeriodId: periodId },
    attributes: ['dueDate'],
  });
  return exams.some((exam) => {
    const examDate = exam.dueDate ? toDateOnly(exam.dueDate) : null;
    return examDate && (
      (value.startDate && examDate < value.startDate)
      || (value.endDate && examDate > value.endDate)
    );
  });
}

const getAll = async (req, res, next) => {
  try {
    const periods = await AcademicPeriod.findAll({
      order: [['schoolYear', 'DESC'], ['periodType', 'ASC'], ['number', 'ASC']],
    });
    return res.json(periods);
  } catch (error) {
    return next(error);
  }
};

const getForCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [{ model: Roles, as: 'Role', attributes: ['role'] }],
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const role = user.Role?.role?.toUpperCase();
    const noteWhere = {};
    const examWhere = {};

    if (role === 'STUDENT') {
      noteWhere.studentId = user.id;
    } else if (role === 'TEACHER') {
      examWhere.teacherId = user.id;
    } else if (role?.includes('PARENT')) {
      const links = await ParentStudent.findAll({
        where: { parentId: user.id },
        attributes: ['studentId'],
      });
      const childIds = links.map(({ studentId }) => studentId);
      if (childIds.length === 0) return res.json([]);
      noteWhere.studentId = childIds;
    } else {
      return res.json(await AcademicPeriod.findAll({
        order: [['schoolYear', 'DESC'], ['periodType', 'ASC'], ['number', 'ASC']],
      }));
    }

    const periods = await AcademicPeriod.findAll({
      include: [{
        model: Exam,
        as: 'Exams',
        attributes: [],
        required: true,
        where: examWhere,
        include: [{
          model: Note,
          attributes: [],
          required: true,
          where: noteWhere,
        }],
      }],
      order: [['schoolYear', 'DESC'], ['periodType', 'ASC'], ['number', 'ASC']],
    });

    return res.json(periods);
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const result = validatePeriod(req.body);
    if (result.error) return res.status(400).json({ message: result.error });
    if (await hasConflictingPeriodScheme(result.value.schoolYear, result.value.periodType)) {
      return res.status(409).json({ message: 'Une année scolaire ne peut pas mélanger trimestres et semestres.' });
    }

    const period = await AcademicPeriod.create(result.value);
    return res.status(201).json(period);
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const period = await AcademicPeriod.findByPk(req.params.id);
    if (!period) return res.status(404).json({ message: 'Période scolaire introuvable.' });

    const result = validatePeriod(req.body);
    if (result.error) return res.status(400).json({ message: result.error });
    if (await hasConflictingPeriodScheme(result.value.schoolYear, result.value.periodType, period.id)) {
      return res.status(409).json({ message: 'Une année scolaire ne peut pas mélanger trimestres et semestres.' });
    }
    if (await hasExamsOutsidePeriod(period.id, result.value)) {
      return res.status(409).json({ message: 'Les dates sélectionnées excluraient des examens déjà associés à cette période.' });
    }

    await period.update(result.value);
    return res.json(period);
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const period = await AcademicPeriod.findByPk(req.params.id);
    if (!period) return res.status(404).json({ message: 'Période scolaire introuvable.' });

    const linkedExams = await Exam.count({ where: { academicPeriodId: period.id } });
    if (linkedExams > 0) {
      return res.status(409).json({ message: 'Cette période est utilisée par des examens et ne peut pas être supprimée.' });
    }

    await period.destroy();
    return res.json({ message: 'Période supprimée.' });
  } catch (error) {
    return next(error);
  }
};

export default { getAll, getForCurrentUser, create, update, delete: remove };