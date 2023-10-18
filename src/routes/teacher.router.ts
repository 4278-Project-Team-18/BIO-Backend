import {
  createTeacher,
  changeTeacherApproval,
  getTeacher,
  getTeachers,
} from '../controllers/teacher.controller';
import express from 'express';

const teacherRouter = express.Router();

/* Admin Controller */
teacherRouter.post('/', createTeacher);
teacherRouter.get('/:teacherId', getTeacher);
teacherRouter.get('/', getTeachers);
teacherRouter.patch(
  '/:teacherId/changeTeacherApprovalStatus',
  changeTeacherApproval
);

export = teacherRouter;
