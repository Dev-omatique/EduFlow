import { Router } from 'express';
import roomController from '../controllers/roomController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var roomRouter = Router();

roomRouter.get('/', checkPermission('MANAGE_ROOMS'), roomController.getAll);
roomRouter.post('/', checkPermission('MANAGE_ROOMS'), roomController.create);
roomRouter.put('/:id', checkPermission('MANAGE_ROOMS'), roomController.update);
roomRouter.delete('/:id', checkPermission('MANAGE_ROOMS'), roomController.delete);


// ---------------------------------------------------- //

export default roomRouter;