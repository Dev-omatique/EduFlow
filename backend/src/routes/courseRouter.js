import { Router } from 'express';
import courseController from '../controllers/courseController.js';

var courseRouter = Router();

courseRouter.post('/', courseController.create);

courseRouter.put('/:id', courseController.update);

courseRouter.delete('/:id', courseController.delete);

// ---------------------------------------------------- //

courseRouter.get('/:type/:id', courseController.getTypeAll);

export default courseRouter;