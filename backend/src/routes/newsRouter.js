import { Router } from 'express';
import newsController from '../controllers/newsController.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import { checkRole } from '../middlewares/checkRole.js';

const newsRouter = Router();

newsRouter.get('/', checkPermission('VIEW_NOTIFICATIONS'), newsController.getAll);

newsRouter.post(
	'/',
	checkRole('VIE_SCOLAIRE'),
	checkPermission('SEND_GROUP_MESSAGES'),
	newsController.create
);

newsRouter.delete(
	'/:id',
	checkRole('VIE_SCOLAIRE'),
	checkPermission('SEND_GROUP_MESSAGES'),
	newsController.delete
);

export default newsRouter;