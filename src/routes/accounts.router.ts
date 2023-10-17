import { createAdmin } from '../controllers/admin.controller';
import express from 'express';

const accountsRouter = express.Router();

/* Admin Controller */
accountsRouter.post('/', createAdmin);

export = accountsRouter;
