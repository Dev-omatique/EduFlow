import { Router } from 'express';
import examController from '../controllers/examController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var examRouter = Router();

examRouter.get('/:id/students', checkPermission('VIEW_EXAMS'), examController.getStudentsByExam);
examRouter.get('/:type/:id', checkPermission('VIEW_EXAMS'), examController.getTypeAll);
examRouter.get('/:id', checkPermission('VIEW_EXAMS'), examController.getOne);

examRouter.post('/', checkPermission('CREATE_EXAMS'), examController.create);


export default examRouter;