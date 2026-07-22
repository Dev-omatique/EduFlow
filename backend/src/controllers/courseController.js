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
            grade: 'gradeId'
        };

        const idKey = typeMapping[type];

        if (!idKey) {
            return res.status(400).json({ message: "Type invalide (doit être 'teacher' ou 'grade')" });
        }

        const where = {
            [idKey]: Number(id),
        };

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
                    attributes: ['firstName', 'lastName']
                },
                {
                    model: db.Room,
                    attributes: ['name']
                },
                {
                    model: db.Grade,
                    attributes: ['name']
                },
                {
                    model: db.Subject,
                    attributes: ['type']
                },
            ],
        });

        const finalCourses = [];
        const windowStart = new Date(startDate);
        const windowEnd = new Date(endDate);

        windowEnd.setHours(23, 59, 59, 999); 

        for (const course of courses) {
            const courseJson = course.toJSON();

            if (!courseJson.recurrent) {
                finalCourses.push(courseJson);
                continue;
            }

            let currentStart = new Date(courseJson.startTime);
            let currentEnd = new Date(courseJson.endTime);
            const recurrentUntil = new Date(courseJson.recurrentUntil);
            recurrentUntil.setHours(23, 59, 59, 999);

            while (currentStart < windowStart) {
                currentStart.setDate(currentStart.getDate() + 7);
                currentEnd.setDate(currentEnd.getDate() + 7);
            }

            while (currentStart <= windowEnd && currentStart <= recurrentUntil) {
                
                finalCourses.push({
                    ...courseJson,
                    id: `${courseJson.id}_${currentStart.toISOString().split('T')[0]}`, 
                    startTime: currentStart.toISOString(),
                    endTime: currentEnd.toISOString(),
                });

                currentStart.setDate(currentStart.getDate() + 7);
                currentEnd.setDate(currentEnd.getDate() + 7);
            }
        }

        res.json(finalCourses);

    } catch (err) {
        next(err);
    }
};

export default {create, update, delete: remove, getTypeAll};