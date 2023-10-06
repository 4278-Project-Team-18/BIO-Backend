import {
  createTeacher,
  getTeachers,
  changeTeacherApproval,
} from '../controllers/teacher.controller';
import express from 'express';

const teacherRouter = express.Router();

/* Admin Controller */
teacherRouter.post('/', createTeacher);
teacherRouter.get('/allTeachers', getTeachers);
teacherRouter.patch(
  '/:teacherId/changeTeacherApprovalStatus',
  changeTeacherApproval
);

export = teacherRouter;
