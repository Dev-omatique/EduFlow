import { Router } from 'express';
var gradeRouter = Router();

gradeRouter.post('/', gradeController.create);

gradeRouter.put('/:id', gradeController.update);

gradeRouter.delete('/:id', gradeController.delete);

// ---------------------------------------------------- //

gradeRouter.get('/:type/:id', gradeController.getTypeAll);

export default gradeRouter;