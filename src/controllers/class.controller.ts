import Class from '../models/class.model';
import Student from '../models/student.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';

import Teacher from '../models/teacher.model';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

/**
 * Create a new class with no students and add it to the database.
 */
export const createClass = async (req: Request, res: Response) => {
  // get class object from request body
  const classObj = req.body;

  // check if class object is provided
  if (!classObj || Object.keys(classObj).length === 0) {
    return res.status(400).json({ error: 'No class object provided.' });
  }

  // check if class object has all required keys and no extraneous keys
  const keyValidationString = verifyKeys(classObj, KeyValidationType.CLASS);
  if (keyValidationString) {
    return res.status(400).json({ error: keyValidationString });
  }

  try {
    // create new class mongo object
    const newClass = new Class(classObj);

    // get the teacher associated with the new class
    const teacher = await Teacher.findById(classObj.teacherId);

    // if the teacher exists add the class id to the teacher
    if (teacher) {
      // add class id to teacher
      teacher.classes.push(newClass._id);

      // save new class to database
      await teacher.save();
    }

    await newClass.save();

    // return new class
    return res.status(201).json(newClass);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all classes from database.
 */
export const getClasses = async (_: Request, res: Response) => {
  try {
    const classes = await Class.find({}).populate('students');

    // if classes is null return 400
    if (!classes) {
      return res.status(400).json({ error: 'No classes found.' });
    }

    // return new class
    return res.status(200).json(classes);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new student and add it to a class.
 */
export const addStudentToClass = async (req: Request, res: Response) => {
  // get class id and student id from request body
  const { firstName, lastInitial, readingLevel } = req.body;

  // get class id from request params
  const { classId } = req.params;

  if (!classId) {
    return res.status(400).json({ error: 'No class id provided.' });
  }

  if (!req.body || (!firstName && !lastInitial && !readingLevel)) {
    return res.status(400).json({ error: 'No student object provided.' });
  }

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: 'Invalid classId.' });
  }

  // check if class id and student id are provided
  const keyValidationString = verifyKeys(req.body, KeyValidationType.STUDENT);
  if (keyValidationString) {
    return res.status(400).json({ error: keyValidationString });
  }

  try {
    const newStudent = new Student({
      firstName,
      lastInitial,
      readingLevel,
    });

    // find class by id
    const classObj = await Class.findById(classId);

    // if class is null return 400
    if (!classObj) {
      return res.status(400).json({ error: 'Cannot find class object.' });
    }

    // add student id to class
    classObj.students.push(newStudent._id);

    // save class to database
    await newStudent.save();
    await classObj.save();

    // return new class
    return res.status(201).json(newStudent);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const removeStudentFromClass = async (req: Request, res: Response) => {
  // get class id and student id from request body
  const { studentId } = req.body;

  // get class id from request params
  const { classId } = req.params;

  if (!classId) {
    return res.status(400).json({ error: 'No class id provided.' });
  }

  if (!studentId) {
    return res.status(400).json({ error: 'No student id provided.' });
  }

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: 'Invalid classId.' });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: 'Invalid studentId.' });
  }

  try {
    // find class by id
    const classObj = await Class.findById(classId);
    const studentObj = await Student.findById(studentId);

    // if class is null return 400
    if (!classObj) {
      return res.status(400).json({ error: 'Cannot find class object.' });
    }

    if (!studentObj) {
      return res.status(400).json({ error: 'Cannot find student object.' });
    }

    // remove student id from class
    classObj.students = classObj.students.filter(
      (student: any) => student._id.toString() !== studentId
    );

    // save class to database
    await classObj.save();
    await studentObj.deleteOne();

    // return new class
    return res.status(200).json({
      message: 'Successfully removed student.',
      studentId: studentObj._id,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
