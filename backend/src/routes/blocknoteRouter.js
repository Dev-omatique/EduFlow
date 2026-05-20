import { Router } from 'express';
import blocknoteController from '../controllers/blocknoteController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var blocknoteRouter = Router();

blocknoteRouter.get('/:id', checkPermission('VIEW_DOCUMENTS'), blocknoteController.getOne);

blocknoteRouter.post('/', checkPermission('MANAGE_DOCUMENTS'), blocknoteController.create);

blocknoteRouter.put('/:id', checkPermission('MANAGE_DOCUMENTS'), blocknoteController.update);

blocknoteRouter.delete('/:id', checkPermission('MANAGE_DOCUMENTS'), blocknoteController.delete);

// ---------------------------------------------------- //

export default blocknoteRouter;