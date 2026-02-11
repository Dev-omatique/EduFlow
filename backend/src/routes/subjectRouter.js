import { Router } from 'express';
import subjectController from '../controllers/subjectController.js';

var subjectRouter = Router();

subjectRouter.get('/', subjectController.getAll);

subjectRouter.get('/:id', subjectController.getOne);

subjectRouter.post('/', subjectController.create);

subjectRouter.put('/:id', subjectController.update);

subjectRouter.delete('/:id', subjectController.delete);

export default subjectRouter;