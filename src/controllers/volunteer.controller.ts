import Volunteer from '../models/volunteer.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

export const createVolunteer = async (req: Request, res: Response) => {
  // get Volunteer object from request body
  const volunteerObj = req.body;

  // check if Volunteer object is provided
  if (!volunteerObj || Object.keys(volunteerObj).length === 0) {
    return res.status(400).json({ error: 'No volunteer object provided.' });
  }

  // check if Volunteer object has all required keys and no extraneous keys
  const keyValidationString = verifyKeys(
    volunteerObj,
    KeyValidationType.VOLUNTEER
  );
  if (keyValidationString) {
    return res.status(400).json({ error: keyValidationString });
  }

  try {
    // create new Volunteer mongo object
    const newVolunteer = new Volunteer(volunteerObj);

    // save new Volunteer to database
    await newVolunteer.save();

    // return new Volunteer
    return res.status(201).json(newVolunteer);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await Volunteer.find({});

    // return all volunteers
    return res.status(200).json(volunteers);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const approveVolunteer = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;

  if (!volunteerId) {
    return res.status(400).json({ error: 'No volunteer id provided.' });
  }

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    return res.status(400).json({ error: 'Invalid volunteer ID.' });
  }

  try {
    const volunteerObj = await Volunteer.findById(volunteerId);

    if (!volunteerObj) {
      return res.status(400).json({ error: 'cannot find volunteer object' });
    }

    volunteerObj.approvalStatus = 'approved';
    await volunteerObj.save();

    return res.status(200).json(volunteerObj);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const denyVolunteer = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;

  if (!volunteerId) {
    return res.status(400).json({ error: 'No volunteer id provided.' });
  }

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    return res.status(400).json({ error: 'Invalid volunteer ID.' });
  }

  try {
    const volunteerObj = await Volunteer.findById(volunteerId);

    if (!volunteerObj) {
      return res.status(400).json({ error: 'cannot find volunteer object' });
    }

    volunteerObj.approvalStatus = 'denied';
    await volunteerObj.save();

    return res.status(200).json(volunteerObj);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
