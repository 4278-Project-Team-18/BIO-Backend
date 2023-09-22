import {
  createTestAdmin,
  createTestClass,
  createTestStudent,
} from './testData/testData';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import { assert } from 'chai';
import type { Student } from '../interfaces/student.interface';
import type { Class } from '../interfaces/class.interface';
import type { Admin } from '../interfaces/admin.interface';

describe('🧪 Test validation utils', () => {
  // ADMIN TESTS
  it('should validate keys in admin object', done => {
    try {
      assert(verifyKeys(createTestAdmin(), KeyValidationType.ADMIN) === '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are missing from admin object', done => {
    try {
      const badAdmin = createTestAdmin() as Partial<Admin>;
      delete badAdmin?.email;
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are extraneous in admin object', done => {
    try {
      const badAdmin = createTestAdmin() as any;
      badAdmin.extraneous = 'extraneous';
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });

  // CLASS TESTS
  it('should validate keys in class object', done => {
    try {
      assert(verifyKeys(createTestAdmin(), KeyValidationType.ADMIN) === '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are missing from class object', done => {
    try {
      const badAdmin = createTestClass() as Partial<Class>;
      delete badAdmin?.name;
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are extraneous in class object', done => {
    try {
      const badAdmin = createTestClass() as any;
      badAdmin.extraneous = 'extraneous';
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });

  // STUDENT TESTS
  it('should validate keys in student object', done => {
    try {
      assert(verifyKeys(createTestStudent(), KeyValidationType.STUDENT) === '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are missing from student object', done => {
    try {
      const badAdmin = createTestStudent() as Partial<Student>;
      delete badAdmin.firstName;
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are extraneous in student object', done => {
    try {
      const badAdmin = createTestStudent() as any;
      badAdmin.extraneous = 'extraneous';
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });

  // VOLUNTEER TESTS
  it('should validate keys in volunteer object', done => {
    try {
      assert(verifyKeys(createTestStudent(), KeyValidationType.STUDENT) === '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are missing from volunteer object', done => {
    try {
      const badAdmin = createTestStudent() as Partial<Student>;
      delete badAdmin.firstName;
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if keys are extraneous in volunteer object', done => {
    try {
      const badAdmin = createTestStudent() as any;
      badAdmin.extraneous = 'extraneous';
      assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
      done();
    } catch (error) {
      done(error);
    }
  });
});
