import { Router } from 'express';
var noteRouter = Router();

noteRouter.post('/', noteController.create);

noteRouter.put('/:id', noteController.update);

noteRouter.delete('/:id', noteController.delete);

// ---------------------------------------------------- //

noteRouter.get('/:type/:id', noteController.getTypeAll);

export default noteRouter;