import db from '../models/index.js';

const { Room } = db;

/**
 * Récupère toutes les salles avec pagination
 */
const getAll = async (req, res, next) => {
    try {
        // Extraction des paramètres de pagination avec valeurs par défaut
        const pageNum = Number(req.query.page) || 1;
        const limitNum = Number(req.query.limit) || 10;

        const queryOptions = {
            limit: limitNum,
            offset: (pageNum - 1) * limitNum,
            order: [['createdAt', 'DESC']]
        };

        // Utilisation de findAndCountAll pour obtenir le total des entrées
        const { count, rows } = await Room.findAndCountAll(queryOptions);

        res.status(200).json({
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                itemsPerPage: limitNum
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Crée une nouvelle salle
 */
const create = async (req, res, next) => {
    try {
        // req.body doit contenir les champs nécessaires (ex: name, capacity)
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (err) {
        next(err);
    }
};

/**
 * Met à jour une salle via son ID passé en paramètre d'URL
 */
const update = async (req, res, next) => {
    try {
        await Room.update(req.body, {
            where: { id: req.params.id },
        });
        res.json({ message: "successful update" });
    } catch (err) {
        next(err);
    }
};

/**
 * Supprime définitivement une salle via son ID
 */
const remove = async (req, res, next) => {
    try {
        await Room.destroy({
            where: { id: req.params.id },
        });
        res.json({ message: "successful delete" });
    } catch (err) {
        next(err);
    }
};

export default { getAll, create, update, delete: remove };