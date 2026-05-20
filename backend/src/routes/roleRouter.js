import { Router } from 'express';
import roleController from '../controllers/roleController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var roleRouter = Router();

roleRouter.get('/', checkPermission('MANAGE_ROLES'), roleController.getAll);

roleRouter.post('/', checkPermission('MANAGE_ROLES'), roleController.create);

roleRouter.put('/:id', checkPermission('MANAGE_ROLES'), roleController.update);

roleRouter.delete('/:id', checkPermission('MANAGE_ROLES'), roleController.delete);

export default roleRouter;