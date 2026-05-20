import { Router } from 'express';
import newsController from '../controllers/newsController.js';
import { checkPermission } from '../middlewares/checkPermission.js';

var newsRouter = Router();

newsRouter.get('/:id' , checkPermission('VIEW_NOTIFICATIONS'), newsController.getOne);

newsRouter.get('/', checkPermission('VIEW_NOTIFICATIONS'), newsController.getAll);

newsRouter.post('/', checkPermission('SEND_GROUP_MESSAGES'), newsController.create);

newsRouter.put('/:id', checkPermission('SEND_GROUP_MESSAGES'), newsController.update);

newsRouter.delete('/:id', checkPermission('SEND_GROUP_MESSAGES'), newsController.delete);

export default newsRouter;