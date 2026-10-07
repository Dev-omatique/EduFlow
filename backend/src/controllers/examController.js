import { Op } from 'sequelize';
import db from '../models/index.js'

const { Exam, Subject, Grade, User, AcademicPeriod } = db;

function toDateOnly(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function getSchoolYear(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

async function getDefaultAcademicPeriodId(dueDate) {
  const period = await AcademicPeriod.findOne({
    where: {
      periodType: 'TRIMESTER',
      number: 1,
      schoolYear: getSchoolYear(dueDate),
    },
  });
  return period?.id ?? null;
}

async function validateAcademicPeriod(academicPeriodId, dueDate, res) {
  if (academicPeriodId === undefined || academicPeriodId === null || academicPeriodId === '') {
    return null;
  }

  const period = await AcademicPeriod.findByPk(Number(academicPeriodId));
  if (!period) {
    res.status(400).json({ message: 'Période scolaire introuvable.' });
    return false;
  }

  const examDate = dueDate ? toDateOnly(dueDate) : null;
  if (examDate && period.startDate && examDate < period.startDate) {
    res.status(400).json({ message: 'La date de l’examen précède la période sélectionnée.' });
    return false;
  }
  if (examDate && period.endDate && examDate > period.endDate) {
    res.status(400).json({ message: 'La date de l’examen dépasse la période sélectionnée.' });
    return false;
  }

  return period.id;
}

const getOne = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({
      where: { id: Number(req.params.id) },
      include: [
        { model: Subject, attributes: ['id', 'type'] },
        { model: Grade, attributes: ['id', 'name'] },
        { model: AcademicPeriod, as: 'AcademicPeriod' },
      ]
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(200).json(exam);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const academicPeriodId = req.body.academicPeriodId
      ? await validateAcademicPeriod(req.body.academicPeriodId, req.body.dueDate, res)
      : await getDefaultAcademicPeriodId(req.body.dueDate);
    if (academicPeriodId === false) return;
    if (!academicPeriodId) {
      return res.status(400).json({
        message: 'Configurez le premier trimestre de cette année scolaire avant de créer un examen sans période.',
      });
    }

    const exam = await Exam.create({ ...req.body, academicPeriodId });
    res.status(201).json(exam);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Examen introuvable.' });

    const dueDate = req.body.dueDate || exam.dueDate;
    const requestedPeriodId = req.body.academicPeriodId === undefined
      ? exam.academicPeriodId
      : req.body.academicPeriodId;
    const usesDefaultPeriod = !requestedPeriodId;
    const academicPeriodId = usesDefaultPeriod
      ? await getDefaultAcademicPeriodId(dueDate)
      : await validateAcademicPeriod(requestedPeriodId, dueDate, res);
    if (academicPeriodId === false) return;
    if (!academicPeriodId) {
      return res.status(400).json({
        message: 'Configurez le premier trimestre de cette année scolaire avant de retirer la période d’un examen.',
      });
    }

    await exam.update({ ...req.body, academicPeriodId });

    res.json({ message: "successful update" });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await Exam.destroy({
      where: { id: req.params.id }
    });
    res.json({ message: "successful delete" });
  } catch (err) {
    next(err);
  }
};

const getStudentsByExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ where: { id: Number(req.params.id) } });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const students = await User.findAll({
      where: { gradeId: exam.gradeId },
      include: [
        {
          association: 'Role',
          attributes: [],
          where: { role: 'STUDENT' },
          required: true,
        },
      ],
      attributes: ['id', 'firstName', 'lastName', 'gradeId'],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
    });

    res.json(students);
  } catch (err) {
    next(err);
  }
};

const getTypeAll = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { startDate, endDate } = req.query;

    const typeMapping = {
      teacher: "teacherId",
      cours: "gradeId",
    };

    const idKey = typeMapping[type];

    if (!idKey) {
      return res.status(400).json({ message: "Type invalide" });
    }

    const where = {
      [idKey]: Number(id),
    };

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate[Op.gte] = startDate;
      if (endDate) where.dueDate[Op.lte] = endDate;
    }

    const exams = await Exam.findAll({
      where,
      include: [
        { model: Subject, attributes: ['id', 'type'] },
        { model: Grade, attributes: ['id', 'name'] },
        { model: AcademicPeriod, as: 'AcademicPeriod' },
      ],
      order: [['dueDate', 'ASC']],
    });
    res.json(exams);
  } catch (err) {
    next(err);
  }
};

export default { getOne, create, update, delete: remove, getStudentsByExam, getTypeAll };