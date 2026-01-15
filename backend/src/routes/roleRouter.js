import { Router } from 'express';
import roleController from '../controllers/roleController.js';

var roleRouter = Router();

roleRouter.get('/', roleController.getAll);

roleRouter.post('/', roleController.create);

roleRouter.put('/:id', roleController.update);

roleRouter.delete('/:id', roleController.delete);

export default roleRouter;