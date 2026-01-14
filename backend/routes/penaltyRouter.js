import { Router } from 'express';
var penaltyRouter = Router();

penaltyRouter.get('/', penaltyController.getAll);

penaltyRouter.get('/:id', penaltyController.getOne);

penaltyRouter.post('/', penaltyController.create);

penaltyRouter.put('/:id', penaltyController.update);

penaltyRouter.delete('/:id', penaltyController.delete);

// ---------------------------------------------------- //

penaltyRouter.get('/:type/:id', penaltyController.getTypeAll);

export default penaltyRouter;