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

export default { create };