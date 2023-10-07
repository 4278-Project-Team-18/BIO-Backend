import { ApprovalStatus } from '../../interfaces/constants';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import type { Invite } from '../../interfaces/invite.interface';
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
    matchedVolunteer: null,
  }) as Student;

export const createTestClass = () =>
  ({
    name: faker.word.adjective() + ' ' + faker.word.noun() + ' Class',
  }) as Class;

export const createTestTeacher = () =>
  ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    approvalStatus: randomApprovalStatus(),
  }) as Teacher;

export const createTestVolunteer = () =>
  ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    approvalStatus: randomApprovalStatus(),
  }) as Volunteer;

export const createTestInvite = () =>
  ({
    email: faker.internet.email(),
    senderId: new mongoose.Types.ObjectId().toString(),
    role: randomRole(),
  }) as Invite;

export const randomApprovalStatus = () => {
  const approvalStatuses = [
    ApprovalStatus.APPROVED,
    ApprovalStatus.PENDING,
    ApprovalStatus.REJECTED,
  ];
  return approvalStatuses[Math.floor(Math.random() * approvalStatuses.length)];
};

export const randomRole = () => {
  const roles = ['teacher', 'volunteer'];
  return roles[Math.floor(Math.random() * roles.length)];
};
