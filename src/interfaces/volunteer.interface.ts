import type { ApprovalStatus } from './constants';

export interface Volunteer {
  firstName: string;
  lastName: string;
  email: string;
  approvalStatus: ApprovalStatus;
  matchedStudents?: string[];
}
