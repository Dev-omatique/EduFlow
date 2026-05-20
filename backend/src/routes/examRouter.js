import { Router } from 'express';
import examController from '../controllers/examController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var examRouter = Router();

examRouter.get('/:id', checkPermission('VIEW_EXAMS'), examController.getOne);

examRouter.post('/', checkPermission('CREATE_EXAMS'), examController.create);

examRouter.put('/:id', checkPermission('CREATE_EXAMS'), examController.update);

examRouter.delete('/:id', checkPermission('CREATE_EXAMS'), examController.delete);

// ---------------------------------------------------- //

examRouter.get('/:type/:id', checkPermission('VIEW_EXAMS'), examController.getTypeAll);

export default examRouter;