import {
  addStudentToClass,
  createClass,
  getClasses,
  removeClassAndStudents,
  removeStudentFromClass,
  updateEstimatedDelivery,
} from '../controllers/class.controller';
import express from 'express';

const classRouter = express.Router();

/* Classes Controller */
classRouter.post('/', createClass);
classRouter.get('/', getClasses);
classRouter.post('/:classId/addStudent', addStudentToClass);
classRouter.delete('/:classId', removeClassAndStudents);
classRouter.delete('/:classId/removeStudent', removeStudentFromClass);
classRouter.patch('/:classId/updateEstimatedDelivery', updateEstimatedDelivery);
export = classRouter;
