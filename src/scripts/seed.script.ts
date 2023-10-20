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
import { Role } from '../interfaces/invite.interface';
import { ApprovalStatus } from '../util/constants';
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
const NUM_TEST_TEACHERS_INVITED = 16;
const NUM_TEST_TEACHERS_APPLIED = 12;
const NUM_REMAINING_TEACHER_INVITES_OPENED = 2;
const NUM_TEST_TEACHERS_APPROVED = 10;
const NUM_TEST_TEACHERS_DENIED = 2;

// classes
const NUM_TEST_CLASSES = 10;
const NUM_TEST_STUDENTS_PER_CLASS = 10;

// volunteers
const NUM_TEST_VOLUNTEERS_INVITED = 18;
const NUM_TEST_VOLUNTEERS_APPLIED = 14;
const NUM_REMAINING_VOLUNTEER_INVITES_OPENED = 2;
const NUM_TEST_VOLUNTEERS_APPROVED = 12;
const NUM_TEST_VOLUNTEERS_DENIED = 2;

// admins
const NUM_TEST_ADMINS_INVITED = 2;

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

describe('🌱 [SEED] Seed the admins into the database', async () => {
  for (let i = 0; i < NUM_TEST_ADMINS_INVITED; i++) {
    it(`should successfully seed admin ${i + 1} into database`, done => {
      chai
        .request(server)
        .post('/admin/')
        .send(createTestAdmin())
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
});

const teacherInviteIds: string[] = [];

describe('🌱 [SEED] Invite teachers', async () => {
  for (let j = 0; j < NUM_TEST_TEACHERS_INVITED; j++) {
    it(`should successfully invite teacher ${j + 1}`, done => {
      chai
        .request(server)
        .post('/invite/sendInvite')
        .send(createTestInvite(Role.TEACHER))
        .then(res => {
          try {
            res.should.have.status(201);
            teacherInviteIds.push(res.body._id);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

const volunteerInviteIds: string[] = [];

describe('🌱 [SEED] Invite volunteers', async () => {
  for (let j = 0; j < NUM_TEST_VOLUNTEERS_INVITED; j++) {
    it(`should successfully invite volunteer ${j + 1}`, done => {
      chai
        .request(server)
        .post('/invite/sendInvite')
        .send(createTestInvite(Role.VOLUNTEER))
        .then(res => {
          try {
            res.should.have.status(201);
            volunteerInviteIds.push(res.body._id);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

const teacherIds: string[] = [];

describe('🌱 [SEED] Accept most of teacher invites and make accounts', async () => {
  for (let i = 0; i < NUM_TEST_TEACHERS_APPLIED; i++) {
    it(`should successfully accept teacher invite ${
      i + 1
    } and create account`, done => {
      chai
        .request(server)
        .post('/accounts/')
        .send({
          ...createTestTeacher(),
          inviteId: teacherInviteIds[i],
          role: Role.TEACHER,
        })
        .then(res => {
          try {
            res.should.have.status(201);
            const teacherInviteId = teacherInviteIds[i];
            teacherInviteIds.filter(id => id !== teacherInviteId);
            teacherIds.push(res.body._id);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

const volunteerIds: string[] = [];

describe('🌱 [SEED] Accept most of volunteer invites and make accounts', async () => {
  for (let i = 0; i < NUM_TEST_VOLUNTEERS_APPLIED; i++) {
    it(`should successfully accept volunteer invite ${
      i + 1
    } and create account`, done => {
      chai
        .request(server)
        .post('/accounts/')
        .send({
          ...createTestVolunteer(),
          inviteId: volunteerInviteIds[i],
          role: Role.VOLUNTEER,
        })
        .then(res => {
          try {
            res.should.have.status(201);
            const volunteerInviteId = volunteerInviteIds[i];
            volunteerInviteIds.filter(id => id !== volunteerInviteId);
            volunteerIds.push(res.body._id);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

const approvedTeacherIds: string[] = [];

describe('🌱 [SEED] Approve most of the signed up teacher accounts', async () => {
  for (let i = 0; i < NUM_TEST_TEACHERS_APPROVED; i++) {
    it(`should successfully approve teacher ${i + 1}`, done => {
      chai
        .request(server)
        .patch(`/teacher/${teacherIds[i]}/changeTeacherApprovalStatus`)
        .send({ newApprovalStatus: ApprovalStatus.APPROVED })
        .then(res => {
          try {
            res.should.have.status(200);
            approvedTeacherIds.push(teacherIds[i]);
            teacherIds.filter(id => id !== teacherIds[i]);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

const approvedVolunteerIds: string[] = [];

describe('🌱 [SEED] Approve most of the signed up volunteer accounts', async () => {
  for (let i = 0; i < NUM_TEST_VOLUNTEERS_APPROVED; i++) {
    it(`should successfully approve volunteer ${i + 1}`, done => {
      chai
        .request(server)
        .patch(`/volunteer/${volunteerIds[i]}/changeVolunteerApprovalStatus`)
        .send({ newApprovalStatus: ApprovalStatus.APPROVED })
        .then(res => {
          try {
            res.should.have.status(200);
            approvedVolunteerIds.push(volunteerIds[i]);
            volunteerIds.filter(id => id !== volunteerIds[i]);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

describe('🌱 [SEED] Deny some of the signed up teacher accounts', async () => {
  for (let i = 0; i < NUM_TEST_TEACHERS_DENIED; i++) {
    it(`should successfully deny teacher ${i + 1}`, done => {
      chai
        .request(server)
        .patch(`/teacher/${teacherIds[i]}/changeTeacherApprovalStatus`)
        .send({ newApprovalStatus: ApprovalStatus.REJECTED })
        .then(res => {
          try {
            res.should.have.status(200);
            teacherIds.splice(0, 1);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

describe('🌱 [SEED] Deny some of the signed up volunteer accounts', async () => {
  for (let i = 0; i < NUM_TEST_VOLUNTEERS_DENIED; i++) {
    it(`should successfully deny volunteer ${i + 1}`, done => {
      chai
        .request(server)
        .patch(`/volunteer/${volunteerIds[i]}/changeVolunteerApprovalStatus`)
        .send({ newApprovalStatus: ApprovalStatus.REJECTED })
        .then(res => {
          try {
            res.should.have.status(200);
            volunteerIds.splice(0, 1);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

describe('🌱 [SEED] Open some of the remaining teacher invites', async () => {
  for (let i = 0; i < NUM_REMAINING_TEACHER_INVITES_OPENED; i++) {
    it(`should successfully open teacher invite ${i + 1}`, done => {
      chai
        .request(server)
        .patch(`/unp-invite/opened/${teacherInviteIds[i]}`)
        .then(res => {
          try {
            teacherInviteIds.filter(id => id !== res.body._id);
            res.should.have.status(200);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

describe('🌱 [SEED] Open some of the remaining volunteer invites', async () => {
  for (let i = 0; i < NUM_REMAINING_VOLUNTEER_INVITES_OPENED; i++) {
    it(`should successfully open volunteer invite ${i + 1}`, done => {
      chai
        .request(server)
        .patch(`/unp-invite/opened/${volunteerInviteIds[i]}`)
        .then(res => {
          try {
            volunteerInviteIds.filter(id => id !== res.body._id);
            res.should.have.status(200);
            done();
          } catch (error) {
            console.error(error);
            done(error);
          }
        });
    });
  }
});

const classIds: string[] = [];

describe('🌱 [SEED] Create classes for most teachers', async () => {
  for (let i = 0; i < NUM_TEST_CLASSES; i++) {
    it(`should successfully seed class ${i + 1} into database`, done => {
      chai
        .request(server)
        .post('/class/')
        .send({
          ...createTestClass(),
          teacherId: approvedTeacherIds[i],
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
