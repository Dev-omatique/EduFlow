import { Router } from 'express';
var classeRouter = Router();

classeRouter.get('/:id', classeController.getOne);

classeRouter.get('/', classeController.getAll);

classeRouter.post('/', classeController.create);

classeRouter.put('/:id', classeController.update);

classeRouter.delete('/:id', classeController.delete);

// ---------------------------------------------------- //

classeRouter.get('/:type/:id', classeController.getTypeAll);

export default classeRouter;