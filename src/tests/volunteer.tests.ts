import { createTestVolunteer } from './testData/testData';
import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';
import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
import type { Volunteer } from '../interfaces/volunteer.interface';

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
  server = app.listen(6004);
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

describe('🧪 Test POST /volunteer/', () => {
  it('should successfully create volunteer', done => {
    // create random test teacher
    const TEST_VOLUNTEER = createTestVolunteer();

    // test request
    chai
      .request(server)
      .post('/volunteer/')
      .send(TEST_VOLUNTEER)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // check for keys
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('email');
        expect(res.body).to.have.property('firstName');
        expect(res.body).to.have.property('lastName');
        expect(res.body).to.have.property('password');
        expect(res.body).to.have.property('approvalStatus');

        // check for values
        expect(res.body.email).to.equal(TEST_VOLUNTEER.email);
        expect(res.body.firstName).to.equal(TEST_VOLUNTEER.firstName);
        expect(res.body.lastName).to.equal(TEST_VOLUNTEER.lastName);
        expect(res.body.password).to.equal(TEST_VOLUNTEER.password);
        expect(res.body.approvalStatus).to.equal(TEST_VOLUNTEER.approvalStatus);

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 if no volunteer object provided', done => {
    // test request
    chai
      .request(server)
      .post('/volunteer/')
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for message
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('No volunteer object provided.');

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 if no email provided', done => {
    // create random test teacher
    const TEST_VOLUNTEER = createTestVolunteer() as Partial<Volunteer>;
    delete TEST_VOLUNTEER.email;

    // test request
    chai
      .request(server)
      .post('/volunteer/')
      .send(TEST_VOLUNTEER)
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

  it('should get all volunteers', done => {
    // test request
    chai
      .request(server)
      .get('/volunteer/allVolunteers')
      .send()
      .then(res => {
        // check for response
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        if (res.body.length > 0) {
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0]).to.have.property('matchedStudents');
        }

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should approve volunteer', done => {
    const TEST_VOLUNTEER = createTestVolunteer();
    // test request
    chai
      .request(server)
      .post('/volunteer/')
      .send(TEST_VOLUNTEER)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // approve volunteer
        chai
          .request(server)
          .patch(`/volunteer/${res.body._id}/changeVolunteerApprovalStatus`)
          .send({ newApprovalStatus: 'approved' })
          .then(res => {
            // check for response
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');

            // check for keys
            expect(res.body).to.have.property('approvalStatus');

            // check for values
            expect(res.body.approvalStatus).to.equal('approved');

            done();
          })
          .catch(err => {
            done(err);
          });
      })
      .catch(err => {
        done(err);
      });
  });

  it('should reject volunteer', done => {
    const TEST_VOLUNTEER = createTestVolunteer();
    // test request
    chai
      .request(server)
      .post('/volunteer/')
      .send(TEST_VOLUNTEER)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // deny volunteer
        chai
          .request(server)
          .patch(`/volunteer/${res.body._id}/changeVolunteerApprovalStatus`)
          .send({ newApprovalStatus: 'rejected' })
          .then(res => {
            // check for response
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');

            // check for keys
            expect(res.body).to.have.property('approvalStatus');

            // check for values
            expect(res.body.approvalStatus).to.equal('rejected');

            done();
          })
          .catch(err => {
            done(err);
          });
      })
      .catch(err => {
        done(err);
      });
  });

  it('should fail to change volunteer status with invalid id', done => {
    // test request
    chai
      .request(server)
      .patch(`/volunteer/12345678/changeVolunteerApprovalStatus`)
      .send({ newApprovalStatus: 'rejected' })
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Invalid volunteer ID.');

        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
