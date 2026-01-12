// routes/UsersRoutes.js
import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany(); 
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
});

export default router;