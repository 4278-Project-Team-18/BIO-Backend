import Volunteer from '../models/volunteer.model';
import Student from '../models/student.model';
import { ApprovalStatus } from '../util/constants';
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

export const changeVolunteerApproval = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;

  const { newApprovalStatus } = req.body;

  if (!volunteerId) {
    return res.status(400).json({ error: 'No volunteer id provided.' });
  }

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    return res.status(400).json({ error: 'Invalid volunteer ID.' });
  }

  if (!Object.values(ApprovalStatus).includes(newApprovalStatus)) {
    return res
      .status(400)
      .json({ error: 'Invalid new status string for volunteer' });
  }

  try {
    const volunteerObj = await Volunteer.findById(volunteerId);

    if (!volunteerObj) {
      return res.status(400).json({ error: 'cannot find volunteer object' });
    }

    volunteerObj.approvalStatus = newApprovalStatus;
    await volunteerObj.save();

    return res.status(200).json(volunteerObj);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const matchVolunteerToStudent = async (req: Request, res: Response) => {
  const { volunteerId, studentId } = req.body;

  if (!volunteerId || !studentId) {
    return res.status(400).json({ error: 'Missing volunteer or student ID.' });
  }

  if (
    !mongoose.Types.ObjectId.isValid(volunteerId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return res.status(400).json({ error: 'Invalid student or volunteer ID.' });
  }

  try {
    const volunteerObj = await Volunteer.findById(volunteerId);
    const studentObj = await Student.findById(studentId);

    if (!volunteerObj || !studentObj) {
      return res
        .status(400)
        .json({ error: 'cannot find volunteer or studentobject' });
    }

    volunteerObj.matchedStudents.push(studentId);
    studentObj.matchedVolunteer = volunteerId;

    await volunteerObj.save();
    await studentObj.save();
    return res.status(200).json({ volunteer: volunteerObj, student: studentObj });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
