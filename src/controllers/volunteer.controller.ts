import Volunteer from '../models/volunteer.model';
import Student from '../models/student.model';
import { ApprovalStatus } from '../util/constants';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import Invite from '../models/invite.model';
import { Role } from '../interfaces/invite.interface';
import { getUserFromRequest } from '../util/tests.util';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import type { RequireAuthProp } from '@clerk/clerk-sdk-node';

export const createVolunteer = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
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
  }
};

export const getVolunteer = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    const { volunteerId } = req.params;

    // check if volunteer id is provided
    if (!volunteerId) {
      return res.status(400).json({ error: 'No volunteer id provided.' });
    }

    try {
      const volunteer =
        await Volunteer.findById(volunteerId).populate('matchedStudents');

      if (!volunteer) {
        return res.status(400).json({ error: 'Volunteer not found!' });
      }

      // return all volunteers
      return res.status(200).json(volunteer);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const getVolunteers = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    try {
      const volunteers = await Volunteer.find({}).populate('matchedStudents');

      // check if volunteers exist
      if (!volunteers) {
        return res.status(400).json({ error: 'Volunteers not found!' });
      }

      // return all volunteers
      return res.status(200).json(volunteers);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const changeVolunteerApproval = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
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
      // get the volunteer object
      const volunteerObj = await Volunteer.findById(volunteerId);

      // return error if volunteer is null
      if (!volunteerObj) {
        return res.status(400).json({ error: 'cannot find volunteer object' });
      }

      // get the invite associated with that email
      const invite = await Invite.findOne({ email: volunteerObj.email });

      if (!invite) {
        return res.status(400).json({ error: 'cannot find invite object' });
      }

      // update the approval status of the volunteer and the invite
      volunteerObj.approvalStatus = newApprovalStatus;
      invite.status = newApprovalStatus;

      // save the updated objects
      await volunteerObj.save();
      await invite.save();

      return res.status(200).json(volunteerObj);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
};

//match volunteer and student
export const matchVolunteerAndStudent = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    const { volunteerId, studentIdArray } = req.body;

    const keyValidationString = verifyKeys(req.body, KeyValidationType.MATCH);
    //input validation
    if (keyValidationString) {
      return res.status(400).json({ error: keyValidationString });
    }

    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ error: 'Invalid volunteer ID' });
    }

    try {
      //get volunteer object
      const volunteerObj = await Volunteer.findById(volunteerId);

      //get all student objects
      let studentPromises = [] as Promise<any>[];
      for (let i = 0; i < studentIdArray.length; ++i) {
        const currentStudentId = studentIdArray[i];
        if (!mongoose.Types.ObjectId.isValid(currentStudentId)) {
          return res.status(400).json({ error: 'Invalid student ID.' });
        }
        const currentStudent = Student.findById(currentStudentId);
        studentPromises.push(currentStudent);
      }

      const studentObjArr = await Promise.all(studentPromises);

      //add student IDs to volunteer
      if (!volunteerObj) {
        return res.status(400).json({ error: 'cannot find volunteer object' });
      }
      volunteerObj.matchedStudents.push(...studentIdArray);

      //add volunteerID to students
      studentPromises = [];
      for (let i = 0; i < studentObjArr.length; ++i) {
        const currentStudent = studentObjArr[i];
        if (!currentStudent) {
          return res.status(400).json({ error: 'cannot find student object' });
        } else {
          currentStudent.matchedVolunteer = volunteerId;
          studentPromises.push(currentStudent.save());
        }
      }

      //await all save operations
      await volunteerObj.save();
      await Promise.all(studentPromises);

      return res
        .status(200)
        .json({ volunteer: volunteerObj, students: studentObjArr });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

//unmatch volunteer and student
export const unmatchVolunteerAndStudent = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER || role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN) {
    const { volunteerId, studentId } = req.body;

    const keyValidationString = verifyKeys(req.body, KeyValidationType.UNMATCH);
    //input validation
    if (keyValidationString) {
      return res.status(400).json({ error: keyValidationString });
    }

    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ error: 'Invalid volunteer ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    try {
      //get volunteer object
      const volunteerObj = await Volunteer.findById(volunteerId);
      const studentObj = await Student.findById(studentId);

      if (!volunteerObj) {
        return res.status(400).json({ error: 'failed to find volunteer object' });
      }

      if (!studentObj) {
        return res.status(400).json({ error: 'failed to find student object' });
      }

      //return error if the two Ids submitted are not currently matched
      if (
        !volunteerObj.matchedStudents.includes(studentId) &&
        studentObj.matchedVolunteer != volunteerId
      ) {
        return res
          .status(400)
          .json({ error: 'volunteer not currently matched to student' });
      }

      //update match fields to ummatch the two objects
      volunteerObj.matchedStudents = volunteerObj.matchedStudents.filter(
        id => id != studentId
      );
      studentObj.matchedVolunteer = undefined;

      //save
      await volunteerObj.save();
      await studentObj.save();

      return res
        .status(200)
        .json({ volunteer: volunteerObj, student: studentObj });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
};
