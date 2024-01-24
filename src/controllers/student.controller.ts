import Student from '../models/student.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import { uploadToS3 } from '../util/s3-upload';
import { getUserFromRequest } from '../util/tests.util';
import logger from '../config/logger.config';
import { Role } from '../interfaces/invite.interface';
import multer from 'multer';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import type { RequireAuthProp } from '@clerk/clerk-sdk-node';

//upload letter error handling
export const uploadErrorHandling = (error: any, res: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'file size is too large',
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'too many files uploaded at once',
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'file can only be of type PDF',
      });
    }
  }
  return res.status(400).json({ error: error });
};

export const createStudent = async (req: Request, res: Response) => {
  // get student object from request body
  const student = req.body;

  // check if student object is provided
  if (!student || Object.keys(student).length === 0) {
    return res.status(400).json({ error: 'No student object provided.' });
  }

  // check if student object has all required keys and no extraneous keys
  const keyValidationString = verifyKeys(student, KeyValidationType.STUDENT);
  if (keyValidationString) {
    return res.status(400).json({ error: keyValidationString });
  }

  try {
    // create new student mongo object
    const newStudent = new Student(student);

    // save new student to database
    await newStudent.save();

    // return new student
    return res.status(201).json(newStudent);
  } catch (error: any) {
    logger.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getStudents = async (
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
      const students = await Student.find({});

      // if classes is null return 400
      if (!students) {
        return res.status(400).json({ error: 'Null students object returned.' });
      }

      // return new class
      return res.status(200).json(students);
    } catch (error: any) {
      logger.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const updateStudent = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN || role === Role.TEACHER) {
    const { studentId } = req.params;

    const studentObj = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'No student id provided.' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID.' });
    }

    if (!studentObj || Object.keys(studentObj).length === 0) {
      return res.status(400).json({ error: 'No student object provided.' });
    }

    const keyValidationString = verifyKeys(studentObj, KeyValidationType.STUDENT);
    if (keyValidationString) {
      return res.status(400).json({ error: keyValidationString });
    }

    try {
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        studentObj,
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(400).json({ error: 'Null student object returned.' });
      }

      return res.status(200).json(updatedStudent);
    } catch (error: any) {
      logger.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const uploadVolunteerLetter = async (req: any, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.VOLUNTEER || role === Role.ADMIN) {
    const { studentId } = req.params;
    const { volunteerId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'no student ID provided' });
    }

    if (!volunteerId) {
      return res.status(400).json({ error: 'no volunteer ID provided ' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ error: 'Invalid volunteer ID' });
    }

    try {
      const studentObj = await Student.findById(studentId);

      if (!studentObj) {
        return res.status(400).json({ error: 'failed to find student object' });
      }

      //if volunteer is not matched to the student return error
      if (studentObj.matchedVolunteer != volunteerId) {
        return res
          .status(400)
          .json({ error: 'volunteer is not matched to the student requested' });
      }

      //call upload with isStudent = false since this is a volunteer letter
      const response = await uploadToS3(req.file, false, studentObj);

      //update object and save
      studentObj.volunteerLetterLink = response.Location;
      await studentObj.save();

      return res.status(201).json(studentObj);
    } catch (error: any) {
      logger.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const uploadStudentLetter = async (req: any, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN || role === Role.TEACHER) {
    const { studentId } = req.params;

    //check if studentId is present
    if (!studentId) {
      return res.status(400).json({ error: 'no student ID provided' });
    }

    //check if studentId is valid
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    try {
      const studentObj = await Student.findById(studentId);

      if (!studentObj) {
        return res.status(400).json({ error: 'failed to find student object' });
      }

      //calls upload to s3 with parameter isStudent = true
      const response = await uploadToS3(req.file, true, studentObj);

      //update object and save
      studentObj.studentLetterLink = response.Location;
      await studentObj.save();

      return res.status(201).json(studentObj);
    } catch (error: any) {
      logger.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const addBookLink = async (req: any, res: Response) => {
  const { role } = getUserFromRequest(req);

  if (role === Role.TEACHER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN || role === Role.VOLUNTEER) {
    const { studentId } = req.params;

    const { newBookLink } = req.body;

    //check if studentId is present
    if (!studentId) {
      return res.status(400).json({ error: 'no student ID provided' });
    }

    if (!newBookLink) {
      return res.status(400).json({ error: 'no new book link provided' });
    }

    //check if studentId is valid
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    try {
      const studentObj = await Student.findById(studentId);

      if (!studentObj) {
        return res.status(400).json({ error: 'failed to find student object' });
      }

      studentObj.assignedBookLink = newBookLink;
      await studentObj.save();

      return res.status(200).json(studentObj);
    } catch (error: any) {
      logger.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
};
