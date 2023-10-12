import { createAdmin, getAdmins } from '../controllers/admin.controller';
import express from 'express';

const adminRouter = express.Router();

/* Admin Controller */
adminRouter.post('/', createAdmin);
adminRouter.get('/allAdmins', getAdmins);

export = adminRouter;
