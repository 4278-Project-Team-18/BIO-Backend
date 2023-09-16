import type { Admin } from '../../interfaces/admin.interface';
import type { Student } from '../../interfaces/student.interface';

export const TEST_ADMIN: Admin = {
  firstName: 'Test',
  lastName: 'Admin',
  email: 'testAdmin@test.com',
  password: 'testPassword',
};

export const TEST_STUDENT: Student = {
  firstName: 'TestStudent',
  lastInitial: 'S',
  readingLevel: '1',
};
