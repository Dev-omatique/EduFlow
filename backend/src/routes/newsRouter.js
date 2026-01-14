import { Router } from 'express';
import newsController from '../controllers/newsController.js';

var newsRouter = Router();

newsRouter.get('/:id', newsController.getOne);

newsRouter.get('/', newsController.getAll);

newsRouter.post('/', newsController.create);

newsRouter.put('/:id', newsController.update);

newsRouter.delete('/:id', newsController.delete);

// ---------------------------------------------------- //

newsRouter.get('/:type/:id', newsController.getTypeAll);

export default newsRouter;