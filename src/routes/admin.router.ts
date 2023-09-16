import { createAdmin } from '../controllers/admin.controller';
import express from 'express';

const adminRouter = express.Router();

/* Admin Controller */
adminRouter.post('/createAdmin', createAdmin);

export = adminRouter;
