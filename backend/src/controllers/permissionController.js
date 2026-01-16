import db from '../models/index.js'

const { Permission } = db

/**
 * Récupère toutes les entrées de Permission
 */
const getAll = async (req,res,next) =>{
    try{
        const permission = await Permission.findAll()
        res.status(200).json(permission)
    }catch(err){
        next(err)
    }
};

/**
 * Crée une nouvelle entrée Permission
 */
const create = async (req, res, next) => {
    try {
        const permission = await Permission.create(req.body);
        res.status(201).json(permission);
    } catch (err) {
        next(err); // Transmet l'erreur au middleware de gestion d'erreurs
    }
};

export default { getAll, create, update, delete: remove };