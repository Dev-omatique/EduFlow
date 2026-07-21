import { Op } from 'sequelize';
import db from "../models/index.js";

const { Course } = db;

/**
 * Si "recurrent" + "recurrentUntil" sont fournis, génère une occurrence
 * hebdomadaire (même jour, même heure) jusqu'à la date de fin incluse.
 * Sinon, retourne une seule occurrence.
 */
const buildOccurrences = (payload) => {
  const { startTime, endTime, recurrent, recurrentUntil, ...rest } = payload;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (!recurrent || !recurrentUntil) {
    return [{
      ...rest,
      startTime: start,
      endTime: end,
      recurrent: !!recurrent,
      recurrentUntil: recurrentUntil ?? null,
    }];
  }

  const until = new Date(recurrentUntil);
  const durationMs = end.getTime() - start.getTime();

  const occurrences = [];
  const cursor = new Date(start);

  while (cursor <= until) {
    occurrences.push({
      ...rest,
      startTime: new Date(cursor),
      endTime: new Date(cursor.getTime() + durationMs),
      recurrent: true,
      recurrentUntil: until,
    });
    cursor.setDate(cursor.getDate() + 7); // toutes les semaines
  }

  return occurrences;
};

const create = async (req, res, next) => {
    try {
        const occurrences = buildOccurrences(req.body);

        if (occurrences.length === 1) {
            const course = await Course.create(occurrences[0]);
            return res.status(201).json(course);
        }

        const courses = await Course.bulkCreate(occurrences);
        res.status(201).json(courses);
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        await Course.update(req.body, {
            where: { id: req.params.id },
        });
        res.json({ message: "successful update" });
    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        await Course.destroy({
            where: { id: req.params.id },
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

        const typeMapping = { teacher: 'teacherId', grade: 'gradeId' };
        const idKey = typeMapping[type];

        if (!idKey) {
            return res.status(400).json({ message: "Type invalide (doit être 'teacher' ou 'grade')" });
        }

        const where = { [idKey]: Number(id) };

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime[Op.gte] = startDate;
            if (endDate) where.startTime[Op.lte] = endDate;
        }

        const courses = await Course.findAll({
            where,
            include: [
                { model: db.User, as: 'teacher', attributes: ['firstName', 'lastName'] },
                { model: db.Room, attributes: ['name'] },
                { model: db.Grade, attributes: ['name'] },
                { model: db.Subject, attributes: ['type'] },
            ],
        });

        res.json(courses);
    } catch (err) {
        next(err);
    }
};

export default { create, update, delete: remove, getTypeAll };