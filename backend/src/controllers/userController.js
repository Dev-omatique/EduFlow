import db from '../models/index.js';

const { User, Role, Exam } = db;

/**
 * Récupère un User spécifique par son ID
 */
const getOne = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

/**
 * Récupère tous les Users avec pagination
 */
const getAll = async (req, res, next) => {
    try {
        const pageNum = Number(req.query.page) || 1;
        const limitNum = Number(req.query.limit) || 50;

        const queryOptions = {
            limit: limitNum,
            offset: (pageNum - 1) * limitNum,
            order: [['createdAt', 'DESC']],
        };

        // findAndCountAll est utilisé pour obtenir simultanément les données et le total pour le front-end
        const { count, rows } = await User.findAndCountAll(queryOptions);

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
 * Crée une nouvelle entrée User
 */
const create = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

/**
 * Met à jour un User via son ID
 */
const update = async (req, res, next) => {
    try {
        // L'ID est extrait des paramètres d'URL pour cibler l'entrée
        await User.update(req.body, {
            where: { id: req.params.id },
        });
        res.json({ message: "successful update" });
    } catch (err) {
        next(err);
    }
};

/**
 * Supprime un User via son ID
 */
const remove = async (req, res, next) => {
    try {
        await User.destroy({
            where: { id: req.params.id },
        });
        res.json({ message: "successful delete" });
    } catch (err) {
        next(err);
    }
};

/**
 * Récupère les examens filtrés par type (ex: rôle) et par date avec pagination
 */
const getTypeAll = async (req, res, next) => {
    try {
        const { type, id } = req.params;
        const { startDate, endDate, page, limit } = req.query;

        // Mappe le paramètre d'URL vers la colonne correspondante en base de données
        const typeMapping = {
            role: "roleId"
        };

        const idKey = typeMapping[type];
        if (!idKey) {
            return res.status(400).json({ message: "Type invalide" });
        }

        // --- Construction dynamique des filtres ---
        const where = { [idKey]: Number(id) };

        if (startDate || endDate) {
            where.dueDate = {};
            if (startDate) where.dueDate[Op.gte] = startDate;
            if (endDate) where.dueDate[Op.lte] = endDate;
        }

        // --- Configuration de la requête globale ---
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        
        const queryOptions = {
            where,
            limit: limitNum,
            offset: (pageNum - 1) * limitNum,
            order: [['dueDate', 'DESC']]
        };

        const { count, rows } = await Exam.findAndCountAll(queryOptions);

        res.json({
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

export default { getOne, getAll, create, update, remove, getTypeAll };