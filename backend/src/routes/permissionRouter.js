import { Router } from 'express';
import permissionController from '../controllers/permissionController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var permissionRouter = Router();

permissionRouter.get('/', checkPermission('MANAGE_PERMISSIONS'), permissionController.getAll);

permissionRouter.post('/', checkPermission('MANAGE_PERMISSIONS'), permissionController.create);

permissionRouter.put('/:id', checkPermission('MANAGE_PERMISSIONS'), permissionController.update);

permissionRouter.delete('/:id', checkPermission('MANAGE_PERMISSIONS'), permissionController.delete);

export default permissionRouter;