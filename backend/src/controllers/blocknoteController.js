import db from '../models/index.js'

const { BlockNote } = db


const getOne = async (req, res, next) => {
    try {
        
        // On cherche par userId et non par ID de note
        const notepad = await BlockNote.findOne({ where: { userId: req.params.id } });
        
        if (!notepad) return res.status(404).json({ message: "Vous n'avez pas encore de notepad." });
        
        res.status(200).json(notepad);
    } catch (error) {
        next(error);
    }
};

/**
 * POST - Créer l'unique notepad de l'utilisateur
 */
const create = async (req, res, next) => {
    try {
        // Vérification 409: L'utilisateur a-t-il déjà un notepad ?
        const existingNotepad = await BlockNote.findOne({ where: { userId: req.params.id } });
        if (existingNotepad) {
            return res.status(409).json({ message: "Un utilisateur ne peut avoir qu'un seul notepad." });
        }
        
        // Ajout forcé du userId de la session
        const newNote = await BlockNote.create({
            ...req.body,
            userId: req.params.id
        });
        
        res.status(201).json(newNote);
    } catch (error) {
        next(error);
    }
};  

/**
 * PUT - Modifier le notepad
 */
const update = async (req, res, next) => {
    try {
        
        const notepad = await BlockNote.findOne({ where: { userId: req.params.id } });
        
        if (!notepad) return res.status(404).json({ message: "Notepad introuvable." });
        
        await notepad.update(req.body, { where: { userId: req.params.id } });
        
        res.status(200).json(notepad);
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE - Supprimer le notepad
 */
export const remove = async (req, res, next) => {
    try {
        
        const deleted = await BlockNote.destroy({ where: { userId: req.user.id } });
        
        if (!deleted) return res.status(404).json({ message: "Rien à supprimer." });
        
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


export default { getOne, create, update, delete: remove };