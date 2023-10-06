import {
  getAllInvites,
  getInvite,
  removeInvite,
  sendInvite,
} from '../controllers/invite.controller';
import express from 'express';

const inviteRouter = express.Router();

/* Classes Controller */
inviteRouter.post('/', sendInvite);
inviteRouter.get('/', getAllInvites);
inviteRouter.get('/:inviteId', getInvite);
inviteRouter.delete('/:inviteId', removeInvite);

export = inviteRouter;
