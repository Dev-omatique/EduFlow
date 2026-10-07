import { Router } from 'express';
import academicPeriodController from '../controllers/academicPeriodController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const academicPeriodRouter = Router();

academicPeriodRouter.get('/mine', checkPermission('VIEW_EXAMS'), academicPeriodController.getForCurrentUser);
academicPeriodRouter.get('/', checkPermission('VIEW_EXAMS'), academicPeriodController.getAll);
academicPeriodRouter.post('/', checkPermission('CREATE_EXAMS'), academicPeriodController.create);
academicPeriodRouter.put('/:id', checkPermission('CREATE_EXAMS'), academicPeriodController.update);
academicPeriodRouter.delete('/:id', checkPermission('CREATE_EXAMS'), academicPeriodController.delete);

export default academicPeriodRouter;