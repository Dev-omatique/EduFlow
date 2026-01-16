import { Router } from 'express';
import roomController from '../controllers/roomController.js';

var roomRouter = Router();

roomRouter.get('/', roomController.getAll);

roomRouter.post('/', roomController.create);

roomRouter.put('/:id', roomController.update);

roomRouter.delete('/:id', roomController.delete);

// ---------------------------------------------------- //

export default roomRouter;