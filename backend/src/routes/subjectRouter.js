import { Router } from 'express';
import subjectController from '../controllers/subjectController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var subjectRouter = Router();

subjectRouter.get('/', checkPermission('VIEW_SUBJECTS'), subjectController.getAll);

subjectRouter.get('/:id', checkPermission('VIEW_SUBJECTS'), subjectController.getOne);

subjectRouter.post('/', checkPermission('MANAGE_SUBJECTS'), subjectController.create);

subjectRouter.put('/:id', checkPermission('MANAGE_SUBJECTS'), subjectController.update);

subjectRouter.delete('/:id', checkPermission('MANAGE_SUBJECTS'), subjectController.delete);

export default subjectRouter;