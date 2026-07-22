import db from '../models/index.js'

const { CourseStatus } = db

const getAll = async (req, res, next) => {
  try {
    const statuses = await CourseStatus.findAll();
    res.status(200).json(statuses);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const status = await CourseStatus.findByPk(req.params.id);
    if (!status) {
      return res.status(404).json({ message: "Statut introuvable" });
    }
    res.status(200).json(status);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const status = await CourseStatus.create(req.body);
    res.status(201).json(status);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    await CourseStatus.update(req.body, {
      where: { id: req.params.id }
    });

    res.json({ message: "successful update" });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await CourseStatus.destroy({
      where: { id: req.params.id }
    });
    res.json({ message: "successful delete" });
  } catch (err) {
    next(err);
  }
};

export default { getAll, getOne, create, update, delete: remove };