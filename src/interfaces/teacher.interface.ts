import type { Role } from './invite.interface';
import type { ApprovalStatus } from '../util/constants';

export interface Teacher {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  approvalStatus: ApprovalStatus;
  classes?: string[];
}
