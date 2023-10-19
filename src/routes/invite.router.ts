import {
  getAllInvites,
  getInvite,
  openInvite,
  removeInvite,
  sendInvite,
} from '../controllers/invite.controller';
import express from 'express';

// protected routes
const inviteRouter = express.Router();

inviteRouter.get('/', getAllInvites);
inviteRouter.post('/sendInvite', sendInvite);
inviteRouter.delete('/:inviteId', removeInvite);

// unprotected routes
const unprotectedInviteRouter = express.Router();

unprotectedInviteRouter.get('/:inviteId', getInvite);
unprotectedInviteRouter.patch('/opened/:inviteId', openInvite);

export { inviteRouter, unprotectedInviteRouter };
