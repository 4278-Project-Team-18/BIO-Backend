import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const importTest = (name, path) => {
  describe(name, () => {
    require(path);
  });
};

describe('top', () => {
  before(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  importTest('admin', './admin.tests.ts');
  importTest('invite', './invite.tests.ts');
  importTest('teacher', './teacher.tests.ts');
  importTest('student', './student.tests.ts');
  importTest('volunteer', './volunteer.tests.ts');
  importTest('class', './class.tests.ts');
});
