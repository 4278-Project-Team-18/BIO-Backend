import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';
import { createTestClass, createTestStudent } from '../tests/testData/testData';
import Teacher from '../models/teacher.model';
import Student from '../models/student.model';
import Class from '../models/class.model';
import Volunteer from '../models/volunteer.model';
import Admin from '../models/admin.model';
import Invite from '../models/invite.model';

import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import chai from 'chai';
import type { Server } from 'http';
dotenv.config();

/**
 * This "script" clears and seeds the database.
 * We use the testing framework to mock the server so we can interact with mongo without have to open up a server in the terminal.
 * It's not a real script, but it's a good way to seed the database.
 */

// teachers

// classes
const NUM_TEST_CLASSES = 3;
const NUM_TEST_STUDENTS_PER_CLASS = 10;

// volunteers

// admins

// set up chai
chai.use(chaiHttp);
chai.should();

// set up mock server
const app = createServer();
let server: Server;

// before tests: connect to mongodb and open mock server
before(async () => {
  await connectTestsToMongo();
  await Teacher.deleteMany({});
  await Student.deleteMany({});
  await Class.deleteMany({});
  await Volunteer.deleteMany({});
  await Admin.deleteMany({});
  await Invite.deleteMany({});
  server = app.listen(6006);
});

// after tests: close mongodb connection and close mock server
after(async () => {
  try {
    // wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    await server.close();
  }
});

const classIds: string[] = [];

describe('🌱 [SEED] Create classes for most teachers', async () => {
  // get the teachers
  const teachers = await Teacher.find({});

  // get the teacher ids
  const teacherIds = teachers.map(teacher => teacher._id);

  for (let i = 0; i < NUM_TEST_CLASSES; i++) {
    it(`should successfully seed class ${i + 1} into database`, done => {
      chai
        .request(server)
        .post('/class/')
        .send({
          ...createTestClass(),
          teacherId: teacherIds[i],
        })
        .then(res => {
          try {
            res.should.have.status(201);
            classIds.push(res.body._id);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

describe('🌱 [SEED] Create students for all classes', async () => {
  for (let i = 0; i < NUM_TEST_CLASSES; i++) {
    for (let j = 0; j < NUM_TEST_STUDENTS_PER_CLASS; j++) {
      it(`should successfully seed student ${
        i * NUM_TEST_STUDENTS_PER_CLASS + j
      } into database`, done => {
        chai
          .request(server)
          .post(`/class/${classIds[i]}/addStudent`)
          .send({ ...createTestStudent(), classId: classIds[i] })
          .then(res => {
            try {
              res.should.have.status(201);
              done();
            } catch (error) {
              console.error(error);
              done(error);
            }
          });
      });
    }
  }
});
