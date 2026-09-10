import { Router } from 'express';
import noteController from '../controllers/noteController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var noteRouter = Router();

noteRouter.post('/', checkPermission('CREATE_GRADES'), noteController.create);

noteRouter.put('/:id', checkPermission('EDIT_GRADES'), noteController.update);
noteRouter.delete('/:id', checkPermission('EDIT_GRADES'), noteController.delete);


// ---------------------------------------------------- //

noteRouter.get('/:type/:id', checkPermission('VIEW_GRADES'), noteController.getTypeAll);

export default noteRouter;