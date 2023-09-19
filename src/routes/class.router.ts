import { createClass } from '../controllers/class.controller';
import express from 'express';

const classRouter = express.Router();

/* Admin Controller */
classRouter.post('/', createClass);

export = classRouter;
