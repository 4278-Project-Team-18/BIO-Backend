import { createTestTeacher } from './testData/testData';
import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';
import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
import type { Teacher } from '../interfaces/teacher.interface';
import type { Server } from 'http';

dotenv.config();

// set up chai
chai.use(chaiHttp);
chai.should();

// set up mock server
const app = createServer();
let server: Server;

// before tests: connect to mongodb and open mock server
before(async () => {
  await connectTestsToMongo();
  server = app.listen(6003);
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

describe('🧪 Test POST /teacher/', () => {
  it('should successfully create teacher', done => {
    // create random test teacher
    const TEST_TEACHER = createTestTeacher();

    // test request
    chai
      .request(server)
      .post('/teacher/')
      .send(TEST_TEACHER)
      .set('role', 'admin')
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // check for keys
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('email');
        expect(res.body).to.have.property('firstName');
        expect(res.body).to.have.property('lastName');
        expect(res.body).to.have.property('approvalStatus');

        // check for values
        expect(res.body.email).to.equal(TEST_TEACHER.email);
        expect(res.body.firstName).to.equal(TEST_TEACHER.firstName);
        expect(res.body.lastName).to.equal(TEST_TEACHER.lastName);
        expect(res.body.approvalStatus).to.equal(TEST_TEACHER.approvalStatus);

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 if no teacher object provided', done => {
    // test request
    chai
      .request(server)
      .post('/teacher/')
      .set('role', 'admin')
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for message
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('No teacher object provided.');

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 if no email provided', done => {
    // create random test teacher
    const TEST_TEACHER = createTestTeacher() as Partial<Teacher>;
    delete TEST_TEACHER.email;

    // test request
    chai
      .request(server)
      .post('/teacher/')
      .set('role', 'admin')
      .send(TEST_TEACHER)
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Missing keys: email. ');

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  // TODO: This test is failing because the teachers are being created not invited therefore the invite does not exist
  // it('should approve teacher', done => {
  //   const TEST_TEACHER = createTestTeacher();
  //   // test request
  //   chai
  //     .request(server)
  //     .post('/teacher/')
  //     .send(TEST_TEACHER)
  //     .then(res => {
  //       // check for response
  //       expect(res.status).to.equal(201);
  //       expect(res.body).to.be.an('object');

  //       // approve volunteer
  //       chai
  //         .request(server)
  //         .patch(`/teacher/${res.body._id}/changeTeacherApprovalStatus`)
  //         .send({ newApprovalStatus: ApprovalStatus.APPROVED })
  //         .then(res => {
  //           // check for response
  //           expect(res.status).to.equal(200);
  //           expect(res.body).to.be.an('object');

  //           // check for keys
  //           expect(res.body).to.have.property('approvalStatus');

  //           // check for values
  //           expect(res.body.approvalStatus).to.equal('approved');

  //           done();
  //         })
  //         .catch(err => {
  //           done(err);
  //         });
  //     })
  //     .catch(err => {
  //       done(err);
  //     });
  // });

  // it('should reject teacher', done => {
  //   const TEST_TEACHER = createTestTeacher();
  //   // test request
  //   chai
  //     .request(server)
  //     .post('/teacher/')
  //     .send(TEST_TEACHER)
  //     .then(res => {
  //       // check for response
  //       expect(res.status).to.equal(201);
  //       expect(res.body).to.be.an('object');

  //       // approve volunteer
  //       chai
  //         .request(server)
  //         .patch(`/teacher/${res.body._id}/changeTeacherApprovalStatus`)
  //         .send({ newApprovalStatus: ApprovalStatus.REJECTED })
  //         .then(res => {
  //           // check for response
  //           expect(res.status).to.equal(200);
  //           expect(res.body).to.be.an('object');

  //           // check for keys
  //           expect(res.body).to.have.property('approvalStatus');

  //           // check for values
  //           expect(res.body.approvalStatus).to.equal('rejected');

  //           done();
  //         })
  //         .catch(err => {
  //           done(err);
  //         });
  //     })
  //     .catch(err => {
  //       done(err);
  //     });
  // });

  it('should fail to change teacher status with invalid id', done => {
    chai
      .request(server)
      .patch('/teacher/invalidId/changeTeacherApprovalStatus')
      .set('role', 'admin')
      .send({ newApprovalStatus: 'approved' })
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Invalid teacher ID.');

        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
