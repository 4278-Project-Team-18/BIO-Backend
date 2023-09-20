import { createStudent } from '../controllers/student.controller';
import express from 'express';

const studentRouter = express.Router();

/* Student Controller */
studentRouter.post('/', createStudent);

export = studentRouter;
