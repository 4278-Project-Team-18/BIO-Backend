import { createAccount, getAccount } from '../controllers/accounts.controller';
import express from 'express';

const accountsRouter = express.Router();

/* Admin Controller */
accountsRouter.post('/', createAccount);
accountsRouter.get('/', getAccount);

export = accountsRouter;
