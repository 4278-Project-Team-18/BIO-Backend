import { ApprovalStatus } from '../util/constants';
import type { Admin } from './admin.interface';

/* eslint-disable autofix/no-unused-vars */
export interface Invite {
  email: string;
  sender: string | Admin;
  role: Role;
  status: InviteStatus;
}

export enum Role {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  VOLUNTEER = 'volunteer',
}

export enum InviteStatus {
  SENT = 'sent',
  OPENED = 'opened',
  COMPLETED = 'completed',
  APPROVED = ApprovalStatus.APPROVED,
  REJECTED = ApprovalStatus.REJECTED,
}
