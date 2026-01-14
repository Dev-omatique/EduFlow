import { Router } from 'express';
import blocknoteController from '../controllers/blocknoteController.js';

var blocknoteRouter = Router();

blocknoteRouter.get('/:id', blocknoteController.getOne);

blocknoteRouter.post('/', blocknoteController.create);

blocknoteRouter.put('/:id', blocknoteController.update);

blocknoteRouter.delete('/:id', blocknoteController.delete);

// ---------------------------------------------------- //

export default blocknoteRouter;