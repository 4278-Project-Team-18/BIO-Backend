import Admin from '../models/admin.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import type { Request, Response } from 'express';

export const createAdmin = async (req: Request, res: Response) => {
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
};

export const getAdmin = async (req: Request, res: Response) => {
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
};
