import { createStudent, getStudents } from '../controllers/student.controller';
import express from 'express';

const studentRouter = express.Router();

/* Student Controller */
studentRouter.post('/', createStudent);
studentRouter.get('/allStudents', getStudents);

export = studentRouter;
