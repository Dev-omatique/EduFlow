import { Router } from 'express';
import gradeController from '../controllers/gradeController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var gradeRouter = Router();

gradeRouter.get('/', checkPermission('VIEW_STUDENT_LIST'), gradeController.getAll);
gradeRouter.get('/type', checkPermission('VIEW_STUDENT_LIST'), gradeController.getTypeAll);
gradeRouter.get('/:id', checkPermission('VIEW_STUDENT_LIST'), gradeController.getOne);
gradeRouter.post('/', checkPermission('MANAGE_CLASSES'), gradeController.create);
gradeRouter.put('/:id', checkPermission('MANAGE_CLASSES'), gradeController.update);
gradeRouter.delete('/:id', checkPermission('MANAGE_CLASSES'), gradeController.delete);

export default gradeRouter;