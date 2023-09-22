import { createClass, getClasses } from '../controllers/class.controller';
import express from 'express';

const classRouter = express.Router();

/* Classes Controller */
classRouter.post('/', createClass);
classRouter.get('/allClasses', getClasses);

export = classRouter;
