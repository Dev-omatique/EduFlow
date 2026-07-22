import { Op } from 'sequelize';
import db from "../models/index.js";

const { Course } = db;

const create = async (req, res, next) => {
    try {
        const { teacherId, gradeId, startTime, endTime } = req.body;

        const conflictingCourse = await Course.findOne({
            where: {
                [Op.or]: [
                    { teacherId: teacherId },
                    { gradeId: gradeId }
                ],
                [Op.and]: [
                    { startTime: { [Op.lt]: new Date(endTime) } },
                    { endTime: { [Op.gt]: new Date(startTime) } }
                ]
            }
        });

        if (conflictingCourse) {
            return res.status(409).json({ 
                message: "Conflit d'horaire : un cours existe déjà pour ce professeur ou cette classe sur ce créneau." 
            });
        }

        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const courseId = req.params.id;

        const existingCourse = await Course.findByPk(courseId);
        if (!existingCourse) {
            return res.status(404).json({ message: "Cours non trouvé" });
        }

        const teacherId = req.body.teacherId !== undefined ? req.body.teacherId : existingCourse.teacherId;
        const gradeId = req.body.gradeId !== undefined ? req.body.gradeId : existingCourse.gradeId;
        const startTime = req.body.startTime !== undefined ? req.body.startTime : existingCourse.startTime;
        const endTime = req.body.endTime !== undefined ? req.body.endTime : existingCourse.endTime;

        const conflictingCourse = await Course.findOne({
            where: {
                id: { [Op.ne]: courseId },
                [Op.or]: [
                    { teacherId: teacherId },
                    { gradeId: gradeId }
                ],
                [Op.and]: [
                    { startTime: { [Op.lt]: new Date(endTime) } },
                    { endTime: { [Op.gt]: new Date(startTime) } }
                ]
            }
        });

        if (conflictingCourse) {
            return res.status(409).json({ 
                message: "Conflit d'horaire : un cours existe déjà pour ce professeur ou cette classe sur ce créneau." 
            });
        }

        await Course.update(req.body, {
            where: { id: courseId },
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

        // Une seule déclaration propre de 'where'
        const where = {};
        if (idKey) {
            where[idKey] = Number(id);
        }

        if (startDate && endDate) {
            where[Op.or] = [
                {
                    recurrent: { [Op.or]: [false, null] },
                    startTime: { [Op.between]: [startDate, endDate] }
                },
                {
                    recurrent: true,
                    startTime: { [Op.lte]: endDate },
                    recurrentUntil: { [Op.gte]: startDate }
                }
            ];
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
                {
                    model: db.CourseStatus,
                    as: 'status',
                    attributes: ['id', 'label']
                }
            ],
        });

        const windowStart = new Date(startDate);
        const windowEnd = new Date(endDate);
        windowEnd.setHours(23, 59, 59, 999); 

        // Séparer les cours non récurrents (ponctuels) des cours récurrents
        const nonRecurrentCourses = courses.filter(c => !c.recurrent);
        const recurrentCourses = courses.filter(c => c.recurrent);

        const finalCourses = [];

        // 1. Ajouter d'abord tous les cours non récurrents
        for (const course of nonRecurrentCourses) {
            finalCourses.push(course.toJSON());
        }

        // 2. Traiter les cours récurrents et filtrer les occurrences en conflit
        for (const course of recurrentCourses) {
            const courseJson = course.toJSON();

            let currentStart = new Date(courseJson.startTime);
            let currentEnd = new Date(courseJson.endTime);
            const recurrentUntil = new Date(courseJson.recurrentUntil);
            recurrentUntil.setHours(23, 59, 59, 999);

            while (currentStart < windowStart) {
                currentStart.setDate(currentStart.getDate() + 7);
                currentEnd.setDate(currentEnd.getDate() + 7);
            }

            while (currentStart <= windowEnd && currentStart <= recurrentUntil) {
                
                // Vérifier si cette occurrence chevauche un cours non récurrent existant
                const hasConflict = nonRecurrentCourses.some(nc => {
                    const ncStart = new Date(nc.startTime);
                    const ncEnd = new Date(nc.endTime);
                    return currentStart < ncEnd && currentEnd > ncStart;
                });

                // Si aucun conflit, on ajoute l'occurrence récurrente
                if (!hasConflict) {
                    finalCourses.push({
                        ...courseJson,
                        id: `${courseJson.id}_${currentStart.toISOString().split('T')[0]}`, 
                        startTime: currentStart.toISOString(),
                        endTime: currentEnd.toISOString(),
                    });
                }

                currentStart.setDate(currentStart.getDate() + 7);
                currentEnd.setDate(currentEnd.getDate() + 7);
            }
        }

        res.json(finalCourses);

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
