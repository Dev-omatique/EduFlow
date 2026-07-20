import { Op } from 'sequelize';
import db from "../models/index.js";

const { Grade } = db;

/**
 * Récupère une classe/note spécifique par son ID
 */
const getOne = async (req, res, next) => {
    try {
        const grades = await Grade.findOne({ where: { id: req.params.id } });
        res.status(200).json(grades);
    } catch (error) {
        next(error);
    }
};

/**
 * Crée une nouvelle entrée Grade
 */
const create = async (req, res, next) => {
    try {
        const grades = await Grade.create(req.body);
        res.status(201).json(grades);
    } catch (err) {
        next(err);
    }
};

/**
 * Met à jour une entrée existante via son ID
 */
const update = async (req, res, next) => {
    try {
        await Grade.update(req.body, {
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
        await Grade.destroy({
            where: { id: req.params.id },
        });
        res.json({ message: "successful delete" });
    } catch (err) {
        next(err);
    }
};

/**
 * Récupère toutes les classes (Grades) pour le select
 */
const getAll = async (req, res, next) => {
    try {
        const grades = await Grade.findAll();
        res.status(200).json(grades);
    } catch (err) {
        next(err);
    }
};


export default { getOne, create, update, delete: remove, getAll };