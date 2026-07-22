import { Router } from 'express';
import courseStatusController from '../controllers/courseStatusController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var courseStatusRouter = Router();

courseStatusRouter.get('/', checkPermission('VIEW_COURSE_STATUS'), courseStatusController.getAll);

courseStatusRouter.get('/:id', checkPermission('VIEW_COURSE_STATUS'), courseStatusController.getOne);

courseStatusRouter.post('/', checkPermission('CREATE_COURSE_STATUS'), courseStatusController.create);

courseStatusRouter.put('/:id', checkPermission('CREATE_COURSE_STATUS'), courseStatusController.update);

courseStatusRouter.delete('/:id', checkPermission('CREATE_COURSE_STATUS'), courseStatusController.delete);

export default courseStatusRouter;