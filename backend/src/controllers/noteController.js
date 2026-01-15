import db from '../models/index.js'

const { Note } = db

const create = async (req, res, next) => {
    try {
        const note = await Note.create(req.body);
        res.status(201).json(note);
    } catch (err) {
        next(err);
    }
};

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

export default { create, update, delete: remove };