import Student from '../models/student.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

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
