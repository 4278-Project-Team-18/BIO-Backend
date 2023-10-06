import Invite from '../models/invite.model';
import { Status } from '../interfaces/invite.interface';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

export const getInvite = async (req: Request, res: Response) => {
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

    // return invite
    return res.status(200).json(invite);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const sendInvite = async (req: Request, res: Response) => {
  // get email, role, and status from request body
  const { email, role, senderId } = req.body;

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

  try {
    // create new invite mongo object
    const newInvite = new Invite({
      email,
      senderId,
      role,
      status: Status.SENT,
    });

    // save new invite to database
    await newInvite.save();

    // return new invite
    return res.status(201).json(newInvite);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const removeInvite = async (req: Request, res: Response) => {
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
};