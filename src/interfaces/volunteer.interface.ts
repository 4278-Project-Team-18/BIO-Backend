import type { ApprovalStatus } from './constants';

export interface Volunteer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  approvalStatus: ApprovalStatus;
  matchedStudents?: string[];
}
