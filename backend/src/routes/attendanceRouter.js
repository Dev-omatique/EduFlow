import { Router } from 'express';
import attendanceController from '../controllers/attendanceController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var attendanceRouter = Router();

attendanceRouter.post('/', checkPermission('CREATE_ATTENDANCE'), attendanceController.create);

attendanceRouter.put('/:id', checkPermission('EDIT_ATTENDANCE'), attendanceController.update);


attendanceRouter.get('/:type/:id', checkPermission('VIEW_ATTENDANCE'), attendanceController.getTypeAll);

export default attendanceRouter;