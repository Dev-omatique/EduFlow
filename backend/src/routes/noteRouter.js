import { Router } from 'express';
import noteController from '../controllers/noteController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const noteRouter = Router();

noteRouter.post('/', checkPermission('CREATE_GRADES'), noteController.create);
noteRouter.post('/bulk', checkPermission(['CREATE_GRADES', 'EDIT_GRADES']), noteController.saveBulk);

noteRouter.put('/:id', checkPermission('EDIT_GRADES'), noteController.update);
noteRouter.delete('/:id', checkPermission('EDIT_GRADES'), noteController.delete);


// ---------------------------------------------------- //

noteRouter.get('/exam/:id/stats', checkPermission('VIEW_GRADES'), noteController.getExamStats);
noteRouter.get('/:type/:id', checkPermission('VIEW_GRADES'), noteController.getTypeAll);

export default noteRouter;