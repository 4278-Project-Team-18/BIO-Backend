import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';
import {
  createTestAdmin,
  createTestClass,
  createTestInvite,
  createTestStudent,
  createTestTeacher,
  createTestVolunteer,
} from '../tests/testData/testData';
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
 *
 * What are we doing with the "promises"?
 * Javascript does not allow for "for" loops to be asynchronous. Thus the promises can not be resolved in the for loop.
 * We can collect all the promises in an array and then resolve them all at once with Promise.all().
 */

// number of test teachers
const NUM_TEST_TEACHERS = 5;

// number of test students per class
const NUM_TEST_STUDENTS_PER_CLASS = 12;

// number of test classes
const NUM_CLASSES_PER_TEACHER = 1;
const NUM_TEST_CLASSES = NUM_TEST_TEACHERS * NUM_CLASSES_PER_TEACHER;

// number of test volunteers
const NUM_TEST_VOLUNTEERS = 10;

// number of test admins
const NUM_TEST_ADMINS = 2;

// number of test invites
const NUM_TEST_INVITES_PER_ADMIN = 6;
const NUM_TEST_INVITES = NUM_TEST_ADMINS * NUM_TEST_INVITES_PER_ADMIN;

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
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    await server.close();
  }
});

describe('🌱 Seeding Database...', () => {
  const teacherIds: string[] = [];

  for (let i = 0; i < NUM_TEST_TEACHERS; i++) {
    it(`should successfully seed teacher ${i + 1} into database`, done => {
      chai
        .request(server)
        .post('/teacher/')
        .send(createTestTeacher())
        .then(res => {
          try {
            res.should.have.status(201);
            teacherIds.push(res.body._id);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }

  for (let i = 0; i < NUM_TEST_CLASSES; i++) {
    it(`should successfully seed class ${
      i + 1
    } into database and students for that class`, done => {
      const newClass = createTestClass();
      newClass.teacherId = teacherIds[i % NUM_TEST_TEACHERS];

      chai
        .request(server)
        .post('/class/')
        .send(newClass)
        .then(res => {
          try {
            res.should.have.status(201);

            for (let j = 0; j < NUM_TEST_STUDENTS_PER_CLASS; j++) {
              try {
                const newStudent = createTestStudent();

                chai
                  .request(server)
                  .post(`/class/${res.body._id}/addStudent`)
                  .send(newStudent)
                  .then(res => {
                    try {
                      res.should.have.status(201);
                    } catch (error) {
                      console.error(error);
                    }
                  });
              } catch (error) {
                console.error(error);
              }
            }
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }

  for (let i = 0; i < NUM_TEST_VOLUNTEERS; i++) {
    it(`should successfully seed volunteer ${i + 1} into database`, done => {
      try {
        const newVolunteer = new Volunteer(createTestVolunteer());
        newVolunteer.save();
        done();
      } catch (error) {
        console.error(error);
        done(error);
      }
    });
  }

  for (let i = 0; i < NUM_TEST_ADMINS; i++) {
    it(`should successfully seed admin ${
      i + 1
    } into database and invites from that admin`, done => {
      chai
        .request(server)
        .post('/admin/')
        .send(createTestAdmin())
        .then(res => {
          try {
            res.should.have.status(201);

            for (let i = 0; i < NUM_TEST_INVITES; i++) {
              const newInvite = createTestInvite();
              newInvite.senderId = res.body._id;
              try {
                chai
                  .request(server)
                  .post('/invite/')
                  .send(newInvite)
                  .then(res => {
                    try {
                      res.should.have.status(201);
                    } catch (error) {
                      console.error(error);
                    }
                  });
              } catch (error) {
                console.error(error);
              }
            }
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});
