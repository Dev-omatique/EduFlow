import db from '../models/index.js'

const { Attendance } = db

const create = async (req, res, next) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    await Attendance.update(req.body, {
      where: { id: req.params.id }
    });

    res.json({ message: "successful update" });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await Attendance.destroy({
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

    let where = {};

    if (type === "user") {
      where = { studentId: id };
    } else if (type === "cours") {
      where = { courseId: id };
    } else {
      return res.status(400).json({ message: "Type invalide" });
    }

    const attendances = await Attendance.findAll({ where });
    res.json(attendances);
  } catch (err) {
    next(err);
  }
};

export default { create, update, delete: remove, getTypeAll };
