import { createTestAdmin } from './testData/testData';
import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';
import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
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
  server = app.listen(6000);
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

describe('🧪 Test POST /admin/', () => {
  it('should successfully create admin', done => {
    // create random test admin
    const TEST_ADMIN = createTestAdmin();

    // test request
    chai
      .request(server)
      .post('/admin/')
      .set('role', 'admin')
      .send(TEST_ADMIN)
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
        expect(res.body.email).to.equal(TEST_ADMIN.email);
        expect(res.body.firstName).to.equal(TEST_ADMIN.firstName);
        expect(res.body.lastName).to.equal(TEST_ADMIN.lastName);
        expect(res.body.approvalStatus).to.equal(TEST_ADMIN.approvalStatus);

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 if no admin object provided', done => {
    chai
      .request(server)
      .post('/admin/')
      .set('role', 'admin')
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for message
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('No admin object provided.');

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 if keys are missing', done => {
    // create random test admin
    const TEST_ADMIN = createTestAdmin();

    // test request
    chai
      .request(server)
      .post('/admin/')
      .set('role', 'admin')
      .send({
        email: TEST_ADMIN.email,
        lastName: TEST_ADMIN.lastName,
      })
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for message
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal(
          'Missing keys: firstName, role, approvalStatus. '
        );

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
