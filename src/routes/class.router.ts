import {
  addStudentToClass,
  createClass,
  getClasses,
} from '../controllers/class.controller';
import express from 'express';

const classRouter = express.Router();

/* Classes Controller */
classRouter.post('/', createClass);
classRouter.get('/allClasses', getClasses);
classRouter.post('/:classId/addStudent', addStudentToClass);

export = classRouter;
