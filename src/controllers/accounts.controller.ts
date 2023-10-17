import { KeyValidationType, verifyKeys } from '../util/validation.util';
import Volunteer from '../models/volunteer.model';
import Teacher from '../models/teacher.model';
import Admin from '../models/admin.model';
import { ApprovalStatus } from '../util/constants';
import type { Request, Response } from 'express';

export const createAccount = async (req: Request, res: Response) => {
  // get student object from request body
  const { firstName, lastName, email, role, inviteId } = req.body;

  // check if invite id is provided
  if (!inviteId) {
    return res.status(400).json({ error: 'No invite id provided.' });
  }

  // check if user role is provided
  if (!role) {
    return res.status(400).json({ error: 'No user role provided.' });
  }

  // check if user role is provided
  const user = {
    firstName,
    lastName,
    email,
    approvalStatus: ApprovalStatus.PENDING,
  };

  // check if user object is provided
  if (!user || Object.keys(user).length === 1) {
    return res.status(400).json({ error: 'No user object provided.' });
  }

  // check if user object has all required keys and no extraneous keys
  const keyValidationString = verifyKeys(user, KeyValidationType.ACCOUNT);
  if (keyValidationString) {
    return res.status(400).json({ error: keyValidationString });
  }

  try {
    // must create an object of the correct type conditionally
    // check if user type is admin
    if (role === 'admin') {
      // create new admin mongo object
      const newAdmin = new Admin(user);

      // save new admin to database
      await newAdmin.save();

      // return new admin
      return res.status(201).json(newAdmin);
    }

    // check if user type is volunteer
    if (role === 'volunteer') {
      // create new Volunteer mongo object
      const newVolunteer = new Volunteer(user);

      // save new Volunteer to database
      await newVolunteer.save();

      // return new Volunteer
      return res.status(201).json(newVolunteer);
    }

    // check if user type is teacher
    if (role === 'teacher') {
      // create new teacher mongo object
      const newTeacher = new Teacher(user);

      // save new teacher to database
      await newTeacher.save();

      // return new teacher
      return res.status(201).json(newTeacher);
    }

    // return error if user type is not valid
    return res.status(400).json({ error: 'Invalid user type.' });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
