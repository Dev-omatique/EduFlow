import { Router } from 'express';
import courseController from '../controllers/courseController.js';

var courseRouter = Router();

courseRouter.get('/:id', courseController.getOne);

courseRouter.post('/', courseController.create);

courseRouter.put('/:id', courseController.update);

courseouter.delete('/:id', courseController.delete);

// ---------------------------------------------------- //

courseRouter.get('/:type/:id;:startDate;:endDate', courseController.getTypeAll);

export default courseRouter;