import { Router } from 'express';
import userController from '../controllers/userController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const userRouter = Router();

// route spéciale
userRouter.get('/me', userController.getMe);

// routes générales
userRouter.get('/', checkPermission('MANAGE_USERS'), userController.getAll);
userRouter.post('/', checkPermission('MANAGE_USERS'), userController.create);

// route spéciale avec 2 params
userRouter.get('/:type/:id', checkPermission('MANAGE_USERS'), userController.getTypeAll);

// routes dynamiques simples
userRouter.get('/:id', checkPermission('MANAGE_USERS'), userController.getOne);
userRouter.put('/:id', checkPermission('MANAGE_USERS'), userController.update);
userRouter.delete('/:id', checkPermission('MANAGE_USERS'), userController.delete);

export default userRouter;