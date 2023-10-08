/* eslint-disable autofix/no-unused-vars */
export const ADMIN_REQUIRED_KEYS = ['firstName', 'lastName', 'email', 'password'];

export const ADMIN_ALL_KEYS = ['firstName', 'lastName', 'email', 'password'];

export const STUDENT_REQUIRED_KEYS = ['firstName', 'lastInitial', 'readingLevel'];

export const STUDENT_ALL_KEYS = [
  'firstName',
  'lastInitial',
  'readingLevel',
  'assignedBookLink',
  'studentLetterLink',
  'volunteerLetterLink',
  'matchedVolunteer',
  'classId',
];

export const CLASS_REQUIRED_KEYS = ['name'];

export const CLASS_ALL_KEYS = [
  'name',
  'teacherId',
  'students',
  'estimatedDelivery',
];

export const TEACHER_REQUIRED_KEYS = [
  'firstName',
  'lastName',
  'email',
  'password',
  'approvalStatus',
];

export const TEACHER_ALL_KEYS = [
  'firstName',
  'lastName',
  'email',
  'password',
  'approvalStatus',
];

export const VOLUNTEER_REQUIRED_KEYS = [
  'firstName',
  'lastName',
  'email',
  'password',
  'approvalStatus',
];

export const VOLUNTEER_ALL_KEYS = [
  'firstName',
  'lastName',
  'email',
  'password',
  'approvalStatus',
  'matchedStudents',
];

export const INVITE_REQUIRED_KEYS = ['email', 'senderId', 'role'];

export const INVITE_ALL_KEYS = ['email', 'senderId', 'role', 'status'];

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
