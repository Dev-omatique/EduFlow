import { Router } from 'express';
import courseController from '../controllers/courseController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var courseRouter = Router();

courseRouter.post('/', checkPermission('MANAGE_SCHEDULE'), courseController.create);

courseRouter.put('/:id', checkPermission('MANAGE_SCHEDULE'), courseController.update);

courseRouter.delete('/:id', checkPermission('MANAGE_SCHEDULE'), courseController.delete);

// ---------------------------------------------------- //
courseRouter.get('/all/all', checkPermission('VIEW_ALL_SCHEDULE'), courseController.getTypeAll);

courseRouter.get('/:id/students', checkPermission('VIEW_SCHEDULE'), courseController.getStudents);

courseRouter.get('/:type/:id', checkPermission('VIEW_SCHEDULE'), courseController.getTypeAll);

export default courseRouter;