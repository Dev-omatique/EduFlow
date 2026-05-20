import { Router } from 'express';
import courseController from '../controllers/courseController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var courseRouter = Router();

courseRouter.post('/', checkPermission('MANAGE_SCHEDULE'), courseController.create);

courseRouter.put('/:id', checkPermission('MANAGE_SCHEDULE'), courseController.update);

courseRouter.delete('/:id', checkPermission('MANAGE_SCHEDULE'), courseController.delete);

// ---------------------------------------------------- //

courseRouter.get('/:type/:id', checkPermission('VIEW_SCHEDULE'), courseController.getTypeAll);

export default courseRouter;