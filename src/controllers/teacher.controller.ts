import Teacher from '../models/teacher.model';
import { ApprovalStatus } from '../util/constants';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import Invite from '../models/invite.model';
import { Role } from '../interfaces/invite.interface';
import { getUserFromRequest } from '../util/tests.util';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import type { RequireAuthProp } from '@clerk/clerk-sdk-node';

export const createTeacher = async (
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
    // get teacher object from request body
    const teacher = req.body;

    // check if teacher object is provided
    if (!teacher || Object.keys(teacher).length === 0) {
      return res.status(400).json({ error: 'No teacher object provided.' });
    }

    // check if teacher object has all required keys and no extraneous keys
    const keyValidationString = verifyKeys(teacher, KeyValidationType.TEACHER);
    if (keyValidationString) {
      return res.status(400).json({ error: keyValidationString });
    }

    try {
      // create new teacher mongo object
      const newTeacher = new Teacher(teacher);

      // save new teacher to database
      await newTeacher.save();

      // return new teacher
      return res.status(201).json(newTeacher);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
};

export const getTeacher = async (
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
    const { teacherId } = req.params;

    // check if teacher id is provided
    if (!teacherId) {
      return res.status(400).json({ error: 'No teacher id provided.' });
    }

    try {
      const teacher = await Teacher.findById(teacherId);

      if (!teacher) {
        return res.status(400).json({ error: 'Teacher not found!' });
      }

      // return teachers list
      return res.status(200).json(teacher);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
};

export const getTeachers = async (
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
      const teachers = await Teacher.find({});

      if (!teachers) {
        return res.status(400).json({ error: 'Teachers not found!' });
      }

      // return teachers list
      return res.status(200).json(teachers);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
};

export const changeTeacherApproval = async (
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
    const { teacherId } = req.params;

    const { newApprovalStatus } = req.body;

    if (!teacherId) {
      return res.status(400).json({ error: 'No teacher id provided.' });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ error: 'Invalid teacher ID.' });
    }

    if (!Object.values(ApprovalStatus).includes(newApprovalStatus)) {
      return res
        .status(400)
        .json({ error: 'Invalid new status string for teacher' });
    }

    try {
      // get teacher object from database
      const teacherObj = await Teacher.findById(teacherId);

      // return error if teacher is null
      if (!teacherObj) {
        return res.status(400).json({ error: 'cannot find teacher object' });
      }

      // get the invite associated with the teacher email
      const invite = await Invite.findOne({ email: teacherObj.email });

      // return error if invite is null
      if (!invite) {
        return res.status(400).json({ error: 'cannot find invite object' });
      }

      // update the teacher and invite objects
      teacherObj.approvalStatus = newApprovalStatus;
      invite.status = newApprovalStatus;

      // save the updated objects
      await teacherObj.save();
      await invite.save();

      return res.status(200).json(teacherObj);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};
