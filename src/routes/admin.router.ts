import { createAdmin } from '../controllers/admin.controller';
import express from 'express';

const adminRouter = express.Router();

/* Ping Controller */
adminRouter.post('/createAdmin', createAdmin);

export = adminRouter;
