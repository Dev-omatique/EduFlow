import { Op } from 'sequelize';
import db from '../models/index.js'

const { Exam, Subject, Grade, User, Roles } = db;

const getOne = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({
      where: { id: Number(req.params.id) },
      include: [
        { model: Subject, attributes: ['id', 'type'] },
        { model: Grade, attributes: ['id', 'name'] }
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
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    await Exam.update(req.body, {
      where: { id: req.params.id }
    });

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
          model: Roles,
          attributes: ['id', 'role'],
          where: { role: 'STUDENT' },
          required: true
        }
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
      ],
      order: [['dueDate', 'ASC']],
    });
    res.json(exams);
  } catch (err) {
    next(err);
  }
};

export default { getOne, create, update, delete: remove, getStudentsByExam, getTypeAll };