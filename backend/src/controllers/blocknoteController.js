import BlockNote from "../models/blocknote.js";

const checkAuth = (req) => req.headers.authorization;

/**
 * GET - Récupérer LE notepad de l'utilisateur connecté
 */
const getOne = async (req, res) => {
    try {
        if (!checkAuth(req)) return res.status(401).json({ message: "Non authentifié" });
        
        // On cherche par userId et non par ID de note
        const notepad = await BlockNote.findOne({ where: { userId: req.user.id } });
        
        if (!notepad) return res.status(404).json({ message: "Vous n'avez pas encore de notepad." });
        
        res.status(200).json(notepad);
    } catch (error) {
        handleErrors(res, error);
    }
};

/**
 * POST - Créer l'unique notepad de l'utilisateur
 */
const create = async (req, res) => {
    try {
        if (!checkAuth(req)) return res.status(401).json({ message: "Non authentifié" });
        if (!req.body.title) return res.status(400).json({ message: "Le titre est requis" });
        
        // Vérification 409: L'utilisateur a-t-il déjà un notepad ?
        const existingNotepad = await BlockNote.findOne({ where: { userId: req.user.id } });
        if (existingNotepad) {
            return res.status(409).json({ message: "Un utilisateur ne peut avoir qu'un seul notepad." });
        }
        
        // Ajout forcé du userId de la session
        const newNote = await BlockNote.create({
            ...req.body,
            userId: req.user.id
        });
        
        res.status(201).json(newNote);
    } catch (error) {
        handleErrors(res, error);
    }
};

/**
 * PUT - Modifier le notepad
 */
const update = async (req, res) => {
    try {
        if (!checkAuth(req)) return res.status(401).json({ message: "Non authentifié" });
        
        const notepad = await BlockNote.findOne({ where: { userId: req.user.id } });
        
        if (!notepad) return res.status(404).json({ message: "Notepad introuvable." });
        
        await notepad.update(req.body);
        
        res.status(200).json(notepad);
    } catch (error) {
        handleErrors(res, error);
    }
};

/**
 * DELETE - Supprimer le notepad
 */
export const remove = async (req, res) => {
    try {
        if (!checkAuth(req)) return res.status(401).json({ message: "Non authentifié" });
        
        const deleted = await BlockNote.destroy({ where: { userId: req.user.id } });
        
        if (!deleted) return res.status(404).json({ message: "Rien à supprimer." });
        
        res.status(204).send();
    } catch (error) {
        handleErrors(res, error);
    }
};

const handleErrors = (res, error) => {
    console.error(error);
    if (error.name === 'SequelizeValidationError') return res.status(422).json({ message: "Erreur validation" });
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: "Doublon détecté" });
    if (error.name === 'SequelizeConnectionError') return res.status(503).json({ message: "BDD indisponible" });
    res.status(500).json({ message: "Erreur serveur" });
};

export { getOne, create, update, remove as delete };