import { Router } from 'express';
import userController from '../controllers/userController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const userRouter = Router();

userRouter.get('/me', userController.getMe);

userRouter.get('/', checkPermission('MANAGE_USERS'), userController.getAll);
userRouter.post('/', checkPermission('MANAGE_USERS'), userController.create);

userRouter.get('/:type/:id', checkPermission('MANAGE_USERS'), userController.getTypeAll);

userRouter.get('/:id', checkPermission('MANAGE_USERS'), userController.getOne);
userRouter.put('/:id', checkPermission('MANAGE_USERS'), userController.update);
userRouter.delete('/:id', checkPermission('MANAGE_USERS'), userController.delete);

export default userRouter;