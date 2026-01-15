import { Op } from 'sequelize';
import db from '../models/index.js'

const { Exam } = db

const getOne = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({where : { gradeId : req.params.id }});
    res.status(201).json(exam);
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

    const exams = await Exam.findAll({ where });
    res.json(exams);
    
  } catch (err) {
    next(err);
  }
};

export default { getOne,create,update, delete: remove, getTypeAll };