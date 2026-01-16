import { Router } from 'express';
import permissionController from '../controllers/permissionController.js';

var permissionRouter = Router();

permissionRouter.get('/', permissionController.getAll);

permissionRouter.post('/', permissionController.create);

permissionRouter.put('/:id', permissionController.update);

permissionRouter.delete('/:id', permissionController.delete);

export default permissionRouter;