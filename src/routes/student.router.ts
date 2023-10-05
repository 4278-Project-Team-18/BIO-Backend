import {
  createStudent,
  getStudents,
  updateStudent,
} from '../controllers/student.controller';
import express from 'express';

const studentRouter = express.Router();

/* Student Controller */
studentRouter.post('/', createStudent);
studentRouter.get('/allStudents', getStudents);
studentRouter.patch('/:studentId', updateStudent);

export = studentRouter;
