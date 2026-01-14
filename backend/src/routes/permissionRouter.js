import { Router } from 'express';
var permissionRouter = Router();

permissionRouter.get('/', permissionController.getAll);

permissionRouter.post('/', permissionController.create);

permissionRouter.put('/:id', permissionController.update);

permissionRouter.delete('/:id', permissionController.delete);

// ---------------------------------------------------- //

permissionRouter.get('/:type/:id', permissionController.getTypeAll);

export default permissionRouter;