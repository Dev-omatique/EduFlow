import db from '../models/index.js'

const { User } = db

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
        // Récupération des paramètres de requête avec des valeurs par défaut
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;

        // Calcul de l'offset (le décalage)
        const offset = (page - 1) * limit;

        // 3. Utilisation de findAndCountAll
        const { count, rows } = await User.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']] // trier par date
        });

        // Calcul du nombre total de pages
        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });

    } catch (err) {
        next(err);
    }
};

export default { };