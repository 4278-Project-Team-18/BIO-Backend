import Teacher from '../models/teacher.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import type { Request, Response } from 'express';

export const createTeacher = async (req: Request, res: Response) => {
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
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await Teacher.find();

    if (!Teacher) {
      return res.status(400).json({ error: 'Null Teachers object returned.' });
    }

    // return teachers list
    return res.status(200).json(teachers);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
