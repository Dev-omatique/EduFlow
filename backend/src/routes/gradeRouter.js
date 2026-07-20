import { Router } from 'express';
import gradeController from '../controllers/gradeController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var gradeRouter = Router();

gradeRouter.get('/',checkPermission('MANAGE_CLASSES'), gradeController.getAll);

// ---------------------------------------------------- //

gradeRouter.get('/:id', checkPermission('VIEW_STUDENT_LIST'), gradeController.getOne);

gradeRouter.post('/', checkPermission('MANAGE_CLASSES'), gradeController.create);

gradeRouter.put('/:id', checkPermission('MANAGE_CLASSES'), gradeController.update);

gradeRouter.delete('/:id', checkPermission('MANAGE_CLASSES'), gradeController.delete);

export default gradeRouter;