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


export default {create};
