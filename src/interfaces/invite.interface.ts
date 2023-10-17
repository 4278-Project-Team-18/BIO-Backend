import type { Admin } from './admin.interface';

/* eslint-disable autofix/no-unused-vars */
export interface Invite {
  email: string;
  sender: string | Admin;
  role: Role;
  status: Status;
}

export enum Role {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum Status {
  SENT = 'sent',
  OPENED = 'opened',
  COMPLETED = 'completed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}
