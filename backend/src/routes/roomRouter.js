import { Router } from 'express';
var roomRouter = Router();

roomRouter.get('/', roomController.getAll);

roomRouter.get('/:id', roomController.getOne);

roomRouter.post('/', roomController.create);

roomRouter.put('/:id', roomController.update);

roomRouter.delete('/:id', roomController.delete);

// ---------------------------------------------------- //

roomRouter.get('/:type/:id', roomController.getTypeAll);

export default roomRouter;