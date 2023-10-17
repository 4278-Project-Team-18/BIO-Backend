import type { ApprovalStatus } from './constants';

export interface Teacher {
  firstName: string;
  lastName: string;
  email: string;
  approvalStatus: ApprovalStatus;
  classes?: string[];
}
