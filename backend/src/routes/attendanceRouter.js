import { Router } from 'express';
import attendanceController from '../controllers/attendanceController.js';

var attendanceRouter = Router();

attendanceRouter.post('/', attendanceController.create);

attendanceRouter.put('/:id', attendanceController.update);

attendanceRouter.delete('/:id', attendanceController.delete);

// ---------------------------------------------------- //

attendanceRouter.get('/:type/:id', attendanceController.getTypeAll);

export default attendanceRouter;