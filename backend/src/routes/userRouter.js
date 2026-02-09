import { Router } from 'express';
import userController from '../controllers/userController.js';

var userRouter = Router();

userRouter.get('/:id', userController.getOne);

userRouter.get('/', userController.getAll);

userRouter.post('/', userController.create);

userRouter.put('/:id', userController.update);

userRouter.delete('/:id', userController.delete);

// ---------------------------------------------------- //

userRouter.get('/:type/:id', userController.getTypeAll);// if type = Role

export default userRouter;