import { Router } from 'express';
var userRouter = Router();

userRouter.get('/:id', userController.getOne);

userRouter.get('/', userController.getAll);

userRouter.post('/', userController.create);

userRouter.put('/:id', userController.update);

userRouter.delete('/:id', userController.delete);

// ---------------------------------------------------- //

userRouter.get('/:type/:id', userController.getTypeAll);// if type = student or teacher

export default userRouter;
