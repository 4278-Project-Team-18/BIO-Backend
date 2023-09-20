import Class from '../models/class.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import type { Request, Response } from 'express';

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

    // save new class to database
    await newClass.save();

    // return new class
    return res.status(201).json(newClass);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
