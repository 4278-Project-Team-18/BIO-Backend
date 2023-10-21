/* eslint-disable autofix/no-unused-vars */
export const ADMIN_REQUIRED_KEYS = [
  'firstName',
  'lastName',
  'email',
  'approvalStatus',
];

export const ADMIN_ALL_KEYS = [
  'firstName',
  'lastName',
  'email',
  'approvalStatus',
];

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
  'approvalStatus',
];

export const TEACHER_ALL_KEYS = [
  'firstName',
  'lastName',
  'email',
  'approvalStatus',
];

export const VOLUNTEER_REQUIRED_KEYS = [
  'firstName',
  'lastName',
  'email',
  'approvalStatus',
];

export const VOLUNTEER_ALL_KEYS = [
  'firstName',
  'lastName',
  'email',
  'approvalStatus',
  'matchedStudents',
];

export const INVITE_REQUIRED_KEYS = ['email', 'role'];

export const INVITE_ALL_KEYS = ['email', 'sender', 'role', 'status'];

export const MATCH_REQUIRED_KEYS = ['volunteerId', 'studentIdArray'];

export const UNMATCH_REQUIRED_KEYS = ['volunteerId', 'studentId'];

export const ACCOUNTS_ALL_KEYS = [
  'firstName',
  'lastName',
  'email',
  'approvalStatus',
];

export const ACCOUNTS_REQUIRED_KEYS = ['firstName', 'lastName', 'email'];

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
