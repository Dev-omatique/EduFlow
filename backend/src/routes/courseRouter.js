import { Router } from 'express';
import courseController from '../controllers/courseController.js';

var courseRouter = Router();

courseRouter.get('/', courseController.getAll);

courseRouter.get('/:id', courseController.getOne);

courseRouter.post('/', courseController.create);

courseRouter.put('/:id', courseController.update);

courseouter.delete('/:id', courseController.delete);

// ---------------------------------------------------- //

courseRouter.get('/:type/:id', courseController.getTypeAll);

export default courseRouter;