import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import type { Volunteer } from '../../interfaces/volunteer.interface';
import type { Teacher } from '../../interfaces/teacher.interface';
import type { Class } from '../../interfaces/class.interface';
import type { Student } from '../../interfaces/student.interface';
import type { Admin } from '../../interfaces/admin.interface';

export const createTestAdmin = () =>
  ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }) as Admin;

export const createTestStudent = () =>
  ({
    firstName: faker.person.firstName(),
    lastInitial: faker.person.lastName().charAt(0),
    readingLevel: faker.number.bigInt({ min: 100, max: 1500 }).toString(),
  }) as Student;

export const createTestClass = () =>
  ({
    name: faker.word.adjective() + ' ' + faker.word.noun() + ' Class',
    teacherId: new mongoose.Types.ObjectId().toString(),
  }) as Class;

export const createTestTeacher = () =>
  ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }) as Teacher;

export const createTestVolunteer = () =>
  ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }) as Volunteer;
