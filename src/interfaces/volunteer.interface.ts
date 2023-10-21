import type { ApprovalStatus } from '../util/constants';

export interface Volunteer {
  firstName: string;
  lastName: string;
  email: string;
  approvalStatus: ApprovalStatus;
  matchedStudents?: string[];
}
