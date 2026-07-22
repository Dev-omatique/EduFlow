import { Router } from 'express';
import sidebarItemController from '../controllers/sidebarController.js';

const sidebarItemRouter = Router();

sidebarItemRouter.get('/', sidebarItemController.getMySidebar);

export default sidebarItemRouter;