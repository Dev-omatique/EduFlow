import { Router } from 'express';
import subjectController from '../controllers/subjectController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var subjectRouter = Router();

subjectRouter.get('/', checkPermission('VIEW_SUBJECTS'), subjectController.getAll);


export default subjectRouter;