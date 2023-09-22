import { createTeacher, getTeachers } from '../controllers/teacher.controller';
import express from 'express';

const teacherRouter = express.Router();

/* Admin Controller */
teacherRouter.post('/', createTeacher);
teacherRouter.get('/allTeachers', getTeachers);

export = teacherRouter;
