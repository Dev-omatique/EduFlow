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

export default { };