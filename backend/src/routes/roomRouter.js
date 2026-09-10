import { Router } from 'express';
import roomController from '../controllers/roomController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var roomRouter = Router();

roomRouter.get('/', checkPermission('MANAGE_ROOMS'), roomController.getAll);


// ---------------------------------------------------- //

export default roomRouter;