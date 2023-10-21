import { createAdmin, getAdmin } from '../controllers/admin.controller';
import express from 'express';

const adminRouter = express.Router();

/* Admin Controller */
adminRouter.post('/', createAdmin);
adminRouter.get('/:adminId', getAdmin);

export = adminRouter;
