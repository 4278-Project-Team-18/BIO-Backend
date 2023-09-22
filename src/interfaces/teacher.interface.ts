import type { ApprovalStatus } from './constants';

export interface Teacher {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  approvalStatus: ApprovalStatus;
  classes?: string[];
}
