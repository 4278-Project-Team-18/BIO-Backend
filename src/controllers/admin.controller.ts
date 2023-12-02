import Admin from '../models/admin.model';
import Invite from '../models/invite.model';
import { ApprovalStatus } from '../util/constants';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import { getUserFromRequest } from '../util/tests.util';
import { Role } from '../interfaces/invite.interface';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

export const createAdmin = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    // get admin object from request body
    const admin = req.body;

    // check if admin object is provided
    if (!admin || Object.keys(admin).length === 0) {
      return res.status(400).json({ error: 'No admin object provided.' });
    }

    // check if admin object has all required keys and no extraneous keys
    const keyValidationString = verifyKeys(admin, KeyValidationType.ADMIN);

    if (keyValidationString) {
      return res.status(400).json({ error: keyValidationString });
    }

    try {
      // create new admin mongo object
      const newAdmin = new Admin(admin);

      // save new admin to database
      await newAdmin.save();

      // return new admin
      return res.status(201).json(newAdmin);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const getAdmin = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    const { adminId } = req.params;

    // check if admin id is provided
    if (!adminId) {
      return res.status(400).json({ error: 'No admin id provided.' });
    }

    try {
      // get admin from database
      const admin = await Admin.findById(adminId);

      // if admin is null return 400
      if (!admin) {
        return res.status(400).json({ error: 'No admin found.' });
      }

      // return admins
      return res.status(200).json(admin);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    try {
      const admins = await Admin.find({});

      if (!admins) {
        return res.status(400).json({ error: 'Admins not found!' });
      }

      // return admins list
      return res.status(200).json(admins);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const changeAdminApproval = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    const { adminId } = req.params;

    const { newApprovalStatus } = req.body;

    if (!adminId) {
      return res.status(400).json({ error: 'No admin id provided.' });
    }

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID.' });
    }

    if (!Object.values(ApprovalStatus).includes(newApprovalStatus)) {
      return res
        .status(400)
        .json({ error: 'Invalid new status string for admin' });
    }

    try {
      // get admin object from database
      const adminObj = await Admin.findById(adminId);

      // return error if admin is null
      if (!adminObj) {
        return res.status(400).json({ error: 'cannot find admin object' });
      }

      // get the invite associated with the admin email
      const invite = await Invite.findOne({ email: adminObj.email });

      // return error if invite is null
      if (!invite) {
        return res.status(400).json({ error: 'cannot find invite object' });
      }

      // update the admin and invite objects
      adminObj.approvalStatus = newApprovalStatus;
      invite.status = newApprovalStatus;

      // save the updated objects
      await adminObj.save();
      await invite.save();

      return res.status(200).json(adminObj);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};
