import Invite from '../models/invite.model';
import { InviteStatus, Role } from '../interfaces/invite.interface';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import { sendInviteEmail } from '../util/email';
import Admin from '../models/admin.model';
import { getUserFromRequest } from '../util/tests.util';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import type { Admin as AdminInterface } from '../interfaces/admin.interface';
dotenv.config();

export const getInvite = async (req: Request, res: Response) => {
  // get invite id from request params
  const { inviteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(inviteId)) {
    return res.status(400).json({ error: 'Invalid inviteId.' });
  }

  try {
    // find invite in database
    const invite = await Invite.findById(inviteId).populate('sender');

    // if invite is null return 400
    if (!invite) {
      return res.status(400).json({ error: 'No invite found.' });
    }

    // return invite
    return res.status(200).json(invite);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const sendInvite = async (req: Request, res: Response) => {
  // get role from request
  const { role: userRole } = getUserFromRequest(req);

  if (userRole === Role.VOLUNTEER || userRole === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (userRole === Role.ADMIN) {
    // get email, role, and status from request body
    const { email, role, sender: senderId } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No invite object provided.' });
    }

    const keyValidationString = verifyKeys(req.body, KeyValidationType.INVITE);
    if (keyValidationString) {
      return res.status(400).json({ error: keyValidationString });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ error: 'Invalid senderId.' });
    }

    // check if invite already exists
    const existingInvite = await Invite.findOne({ email });

    if (existingInvite) {
      return res.status(400).json({ error: 'Invite already exists.' });
    }

    try {
      // create new invite mongo object
      const newInvite = new Invite({
        email,
        sender: senderId,
        role,
        status: InviteStatus.SENT,
      });

      // get sender, uncomment when we do auth
      const sender = (await Admin.findById(senderId)) as AdminInterface;

      if (process.env.ENVIRONMENT === 'production') {
        sendInviteEmail(role, email, sender);
      }

      // save new invite to database
      await newInvite.save();

      // return new invite

      return res.status(201).json(newInvite);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const removeInvite = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    // get invite id from request params
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ error: 'Invalid inviteId.' });
    }

    try {
      // find invite in database
      const invite = await Invite.findById(inviteId);

      // if invite is null return 400
      if (!invite) {
        return res.status(400).json({ error: 'No invite found.' });
      }

      // delete invite from database
      await invite.deleteOne();

      // return invite
      return res.status(200).json(invite);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
};

export const getAllInvites = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    try {
      const invites = await Invite.find({});

      // Check if invites is null
      if (!invites) {
        return res.status(400).json({ error: 'No invites found.' });
      }

      // return invites
      return res.status(200).json(invites);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const openInvite = async (req: Request, res: Response) => {
  // get invite id from request params
  const { inviteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(inviteId)) {
    return res.status(400).json({ error: 'Invalid inviteId.' });
  }

  try {
    // find invite in database
    const invite = await Invite.findById(inviteId);

    // if invite is null return 400
    if (!invite) {
      return res.status(400).json({ error: 'No invite found.' });
    }

    // update invite status to opened
    invite.status = InviteStatus.OPENED;

    // save invite to database
    await invite.save();

    // return invite
    return res.status(200).json(invite);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
