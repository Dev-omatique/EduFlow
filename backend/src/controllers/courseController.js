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

        // 1. Définition de la clé dynamique (teacherId ou gradeId)
        const typeMapping = {
            teacher: 'teacherId',
            grade: 'gradeId'
        };

        const idKey = typeMapping[type];

        // 2. Validation du type
        if (!idKey) {
            return res.status(400).json({ message: "Type invalide (doit être 'teacher' ou 'grade')" });
        }

        const where = {
            [idKey]: Number(id),
        };

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime[Op.gte] = startDate;
            if (endDate) where.startTime[Op.lte] = endDate;
        }

        const courses = await Course.findAll({ where });
        res.json(courses);

    } catch (err) {
        next(err);
    }
};

export default {create, update, remove, getTypeAll};