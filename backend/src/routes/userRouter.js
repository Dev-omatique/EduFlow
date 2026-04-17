import { Router } from 'express';
import userController from '../controllers/userController.js';


const userRouter = Router();

// route spéciale
userRouter.get('/me', userController.getMe);

// routes générales
userRouter.get('/', userController.getAll);
userRouter.post('/', userController.create);

// route spéciale avec 2 params
userRouter.get('/:type/:id', userController.getTypeAll);

// routes dynamiques simples
userRouter.get('/:id', userController.getOne);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.delete);

export default userRouter;