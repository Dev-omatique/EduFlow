import { Router } from 'express';
import courseStatusController from '../controllers/courseStatusController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const courseStatusRouter = Router();

courseStatusRouter.get('/', checkPermission('VIEW_COURSE_STATUS'), courseStatusController.getAll);


export default courseStatusRouter;