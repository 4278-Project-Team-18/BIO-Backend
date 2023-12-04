import Class from '../models/class.model';
import Student from '../models/student.model';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import Teacher from '../models/teacher.model';
import { getUserFromRequest } from '../util/tests.util';
import { Role } from '../interfaces/invite.interface';
import Volunteer from '../models/volunteer.model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import type { RequireAuthProp } from '@clerk/clerk-sdk-node';
import type { Request, Response } from 'express';
dotenv.config();

/**
 * Create a new class with no students and add it to the database.
 */
export const createClass = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN || role === Role.TEACHER) {
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

      // if the teacher exists add the class id to the teacher
      if (classObj.teacherId) {
        // get the teacher associated with the new class
        const teacher = await Teacher.findById(classObj.teacherId);

        if (!teacher) {
          return res.status(400).json({ error: 'Teacher does not exist.' });
        }

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
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

/**
 * Get all classes from database.
 */
export const getClasses = async (
  req: RequireAuthProp<Request>,
  res: Response
) => {
  const { role, email } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  try {
    if (role === Role.TEACHER) {
      const teacher = await Teacher.findOne({ email: email });

      if (!teacher) {
        return res.status(400).json({ error: 'Teacher does not exist.' });
      }

      const classes = await Class.find({
        teacherId: teacher._id,
      }).populate('students');

      return res.status(200).json(classes);
    }

    if (role === Role.ADMIN) {
      const classes = await Class.find().populate('students');

      return res.status(200).json(classes);
    }

    return res.status(400).json({ error: 'Invalid role.' });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new student and add it to a class.
 */
export const addStudentToClass = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN || role === Role.TEACHER) {
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
  }

  return res.status(400).json({ error: 'Invalid role.' });
};

export const removeStudentFromClass = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN || role === Role.TEACHER) {
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
  }
};

export const updateEstimatedDelivery = async (req: Request, res: Response) => {
  // get class id and student id from request body
  const { newEstimatedDelivery } = req.body;

  // get class id from request params
  const { classId } = req.params;

  if (!classId) {
    return res.status(400).json({ error: 'No class id provided.' });
  }

  if (!newEstimatedDelivery) {
    return res.status(400).json({ error: 'No estimated delivery date provided' });
  }

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: 'Invalid classId.' });
  }

  try {
    // find class by id
    const classObj = await Class.findById(classId);

    // if class is null return 400
    if (!classObj) {
      return res.status(400).json({ error: 'Cannot find class object.' });
    }

    classObj.estimatedDelivery = newEstimatedDelivery;

    // save class to database
    await classObj.save();

    // return new class
    return res.status(200).json({
      message: 'Successfully updated estimated delivery.',
      class: classObj,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const removeClassAndStudents = async (req: Request, res: Response) => {
  // get role from request
  const { role } = getUserFromRequest(req);

  if (role === Role.VOLUNTEER) {
    return res.status(403).send({
      message: 'You are not authorized to access this endpoint.',
    });
  }

  if (role === Role.ADMIN || role === Role.TEACHER) {
    // get class id from request body
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ error: 'No class id provided.' });
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: 'Invalid classId.' });
    }

    try {
      // find class by id
      const classObj = await Class.findById(classId);

      // if class is null return 400
      if (!classObj) {
        return res.status(400).json({ error: 'Cannot find class object.' });
      }

      // remove the students from the database
      await Student.deleteMany({ _id: { $in: classObj.students } });

      // remove the class from the teacher
      const teacher = await Teacher.findById(classObj.teacherId);
      if (teacher) {
        teacher.classes = teacher.classes.filter(
          (classId: any) => classId.toString() !== classObj._id.toString()
        );
        await teacher.save();
      }

      // remove the students from the volunteers
      await Volunteer.updateMany(
        { matchedStudents: { $in: classObj.students } },
        { $pullAll: { matchedStudents: classObj.students } }
      );

      // remove the class from the database
      await classObj.deleteOne();

      // return new class
      return res.status(200).json(classObj);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(400).json({ error: 'Invalid role.' });
};
