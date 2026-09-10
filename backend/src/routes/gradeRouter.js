import { Router } from 'express';
import gradeController from '../controllers/gradeController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var gradeRouter = Router();

// ---------------------------------------------------- //

gradeRouter.get('/', checkPermission('VIEW_STUDENT_LIST'), gradeController.getAll);

export default gradeRouter;