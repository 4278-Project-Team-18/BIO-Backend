import Student from '../models/student.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import { uploadToS3 } from '../util/s3-upload';
import multer from 'multer';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

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
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({});

    // if classes is null return 400
    if (!students) {
      return res.status(400).json({ error: 'Null students object returned.' });
    }

    // return new class
    return res.status(200).json(students);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
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
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const uploadVolunteerLetter = async (req: any, res: Response) => {
  const { studentId } = req.params;
  const { volunteerId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'no student ID provided' });
  }

  if (!volunteerId) {
    return res.status(400).json({ error: 'no volunteer ID provided ' });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: 'Invalid volunteer ID' });
  }

  try {
    const studentObj = await Student.findById(studentId);

    if (!studentObj) {
      return res.status(400).json({ error: 'failed to find student object' });
    }

    if (studentObj.matchedVolunteer != volunteerId) {
      return res
        .status(400)
        .json({ error: 'volunteer is not matched to the student requested' });
    }
    const response = await uploadToS3(req.file, false, studentObj);
    studentObj.volunteerLetterLink = response.Location;

    await studentObj.save();

    return res
      .status(201)
      .json({ status: 'success', body: response, student: studentObj });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const uploadStudentLetter = async (req: any, res: Response) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ error: 'no volunteer ID provided' });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: 'Invalid volunteer ID' });
  }

  try {
    const studentObj = await Student.findById(studentId);

    if (!studentObj) {
      return res.status(400).json({ error: 'failed to find student object' });
    }

    //calls parseFile with parameters of parse
    const response = await uploadToS3(req.file, true, studentObj);
    studentObj.studentLetterLink = response.Location;

    await studentObj.save();

    return res
      .status(201)
      .json({ status: 'success', body: response, student: studentObj });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
