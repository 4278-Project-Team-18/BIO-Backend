import type { ApprovalStatus } from '../util/constants';

export interface Admin {
  firstName: string;
  lastName: string;
  email: string;
  approvalStatus: ApprovalStatus;
}
