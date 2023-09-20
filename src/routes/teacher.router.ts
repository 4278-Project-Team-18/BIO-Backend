import { createTeacher } from '../controllers/teacher.controller';
import express from 'express';

const teacherRouter = express.Router();

/* Admin Controller */
teacherRouter.post('/', createTeacher);

export = teacherRouter;
