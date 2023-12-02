import {
  changeAdminApproval,
  createAdmin,
  getAdmin,
  getAdmins,
} from '../controllers/admin.controller';
import express from 'express';

const adminRouter = express.Router();

/* Admin Controller */
adminRouter.post('/', createAdmin);
adminRouter.get('/:adminId', getAdmin);
adminRouter.get('/', getAdmins);
adminRouter.patch('/:adminId/changeAdminApprovalStatus', changeAdminApproval);

export = adminRouter;
