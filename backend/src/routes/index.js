import { Router } from 'express';

import attendanceRouter from './attendanceRouter.js';
import blocknoteRouter from './blocknoteRouter.js';
import gradeRouter from './gradeRouter.js';
import courseRouter from './courseRouter.js';
import examRouter from './examRouter.js';
import noteRouter from './noteRouter.js';
import newsRouter from './newsRouter.js';
import penaltyRouter from './penaltyRouter.js';
import permissionRouter from './permissionRouter.js';
import roleRouter from './roleRouter.js';
import roomRouter from './roomRouter.js';
import subjectRouter from './subjectRouter.js';
import userRouter from './userRouter.js';
import authRoutes from "./authRoutes.js";
import { authRequired } from "../middlewares/authMiddleware.js";


const router = Router();

// publique routes
router.use('/auth', authRoutes);

// activation des routes priver
router.use(authRequired);

// route priver (besoin token)
router.use('/users', userRouter);
router.use('/attendances', attendanceRouter);
router.use('/blocknotes', blocknoteRouter);
router.use('/grades', gradeRouter);
router.use('/courses', courseRouter);
router.use('/exams', examRouter);
router.use('/notes', noteRouter);
router.use('/news', newsRouter);
router.use('/penalties', penaltyRouter);
router.use('/permissions', permissionRouter);
router.use('/roles', roleRouter);
router.use('/rooms', roomRouter);
router.use('/subjects', subjectRouter);
router.get("/me", authRequired, (req, res) => {res.json({  ok: true,user: req.user,});});


export default router;
