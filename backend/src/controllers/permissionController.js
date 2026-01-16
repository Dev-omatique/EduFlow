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

/**
 * Met à jour une entrée existante via son ID
 */
const update = async (req, res, next) => {
    try {
        await Permission.update(req.body, {
            where: { id: req.params.id },
        });
        res.json({ message: "successful update" });
    } catch (err) {
        next(err);
    }
};

export default { getAll, create, update, delete: remove };