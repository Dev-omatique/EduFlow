import { Router } from 'express';
import penaltyController from '../controllers/penaltyController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var penaltyRouter = Router();

penaltyRouter.get('/', checkPermission('VIEW_DISCIPLINARY_REMARK'), penaltyController.getAll);

penaltyRouter.get('/:id', checkPermission('VIEW_DISCIPLINARY_REMARK'), penaltyController.getOne);

penaltyRouter.post('/', checkPermission('CREATE_DISCIPLINARY_REMARK'), penaltyController.create);

penaltyRouter.put('/:id', checkPermission('CREATE_DISCIPLINARY_REMARK'), penaltyController.update);

penaltyRouter.delete('/:id', checkPermission('CREATE_DISCIPLINARY_REMARK'), penaltyController.delete);

// ---------------------------------------------------- //

penaltyRouter.get('/:type/:id', checkPermission('VIEW_DISCIPLINARY_REMARK'), penaltyController.getTypeAll);

export default penaltyRouter;