import express from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            include: {
                model: Role,
                as: 'role'
            }
        }); 
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
});

export default router;