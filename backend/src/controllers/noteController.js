import db from '../models/index.js'

const { Note, Exam, Subject } = db  // ← ajout Subject

/**
 * Crée une nouvelle entrée Note
 */
const create = async (req, res, next) => {
    try {
        const note = await Note.create(req.body);
        res.status(201).json(note);
    } catch (err) {
        next(err);
    }
};

/**
 * Met à jour une entrée existante via son ID
 */
const update = async (req, res, next) => {
    try {
        await Note.update(req.body, {
            where: { id: req.params.id },
        });
        res.json({ message: "successful update" });
    } catch (err) {
        next(err);
    }
};

/**
 * Supprime une entrée via son ID
 */
const remove = async (req, res, next) => {
    try {
        await Note.destroy({
            where: { id: req.params.id },
        });
        res.json({ message: "successful delete" });
    } catch (err) {
        next(err);
    }
};

/**
 * Récupère toutes les entrées selon un type (exam, student, ou subject)
 */
const getTypeAll = async (req, res, next) => {
    try {
        const { type, id } = req.params;

        const typeMapping = {
            exam: 'examId',
            student: 'studentId',
            subject: 'subjectId'
        };

        const idKey = typeMapping[type];

        if (!idKey) {
            return res.status(400).json({ message: "Type invalide (doit être 'exam', 'student' ou 'subject')" });
        }

        let queryOptions = {};

        if (type === 'subject') {
            queryOptions.include = [{
                model: Exam,
                required: true,
                where: { subjectId: Number(id) }
            }];
        } else if (type === 'student') {       // ← nouveau bloc
            queryOptions.where = { studentId: Number(id) };
            queryOptions.include = [{
                model: Exam,
                required: true,
                include: [{ model: Subject }]  // ← inclut la matière
            }];
        } else {
            queryOptions.where = { [idKey]: Number(id) };
        }

        const notes = await Note.findAll(queryOptions);
        res.json(notes);

    } catch (err) {
        next(err);
    }
};

export default { create, update, delete: remove, getTypeAll };