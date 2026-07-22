import { Op } from 'sequelize';
import db from "../models/index.js";

const { Course } = db;

const create = async (req, res, next) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
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

        const typeMapping = {
            teacher: 'teacherId',
            grade: 'gradeId',
            all: null
        };

        if (!(type in typeMapping)) {
            return res.status(400).json({ message: "Type invalide (doit être 'teacher', 'grade' ou 'all')" });
        }

        const idKey = typeMapping[type];

        const where = {};
        if (idKey) {
            where[idKey] = Number(id);
        }

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime[Op.gte] = startDate;
            if (endDate) where.startTime[Op.lte] = endDate;
        }

        const courses = await Course.findAll({
            where,
            include: [
                {
                    model: db.User,
                    as: 'teacher',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: db.Room,
                    attributes: ['id', 'name']
                },
                {
                    model: db.Grade,
                    attributes: ['id', 'name']
                },
                {
                    model: db.Subject,
                    attributes: ['id', 'type']
                },
            ],
        });

        res.json(courses);

    } catch (err) {
        next(err);
    }
};

const getStudents = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: "Cours introuvable" });
        }

        const students = await db.User.findAll({
            where: { gradeId: course.gradeId },
            attributes: ['id', 'firstName', 'lastName'],
            include: [
                {
                    association: 'Role',
                    attributes: [],
                    where: { role: 'STUDENT' },
                    required: true,
                },
            ],
        });

        res.json(students);
    } catch (err) {
        next(err);
    }
};

export default { create, update, delete: remove, getTypeAll, getStudents };