import { Router } from 'express';
var examRouter = Router();

examRouter.get('/:id', examController.getOne);

examRouter.post('/', examController.create);

examRouter.put('/:id', examController.update);

examRouter.delete('/:id', examController.delete);

// ---------------------------------------------------- //

examRouter.get('/:type/:id', examController.getTypeAll);

export default examRouter;