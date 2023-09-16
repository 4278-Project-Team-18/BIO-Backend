import { TEST_ADMIN } from './testData/testData';
import { KeyValidationType, verifyKeys } from '../util/validation.util';
import { assert } from 'chai';

describe('🧪 Test validation utils', () => {
  it('should validate keys in admin object', done => {
    assert(verifyKeys(TEST_ADMIN, KeyValidationType.ADMIN) === '');
    done();
  });

  it('should return an error if keys are missing from admin object', done => {
    const badAdmin = TEST_ADMIN as any;
    delete badAdmin?.email;
    assert(verifyKeys(badAdmin, KeyValidationType.ADMIN) !== '');
    done();
  });
});
