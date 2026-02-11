import { Router } from 'express';
import gradeController from '../controllers/gradeController.js';

var gradeRouter = Router();

gradeRouter.get('/type', gradeController.getTypeAll);

// ---------------------------------------------------- //

gradeRouter.get('/:id', gradeController.getOne);

gradeRouter.post('/', gradeController.create);

gradeRouter.put('/:id', gradeController.update);

gradeRouter.delete('/:id', gradeController.delete);

export default gradeRouter;