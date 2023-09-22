import { createTestStudent } from './testData/testData';
import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';
import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
import type { Student } from '../interfaces/student.interface';
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
  server = app.listen(6001);
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

describe('🧪 Test POST /student/', () => {
  it('should successfully create student', done => {
    // create random test student
    const TEST_STUDENT = createTestStudent();

    // test request
    chai
      .request(server)
      .post('/student/')
      .send(TEST_STUDENT)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // check for keys
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('firstName');
        expect(res.body).to.have.property('lastInitial');
        expect(res.body).to.have.property('readingLevel');

        // check for values
        expect(res.body.firstName).to.equal(TEST_STUDENT.firstName);
        expect(res.body.lastInitial).to.equal(TEST_STUDENT.lastInitial);
        expect(res.body.readingLevel).to.equal(TEST_STUDENT.readingLevel);

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 if no student object provided', done => {
    chai
      .request(server)
      .post('/student/')
      .send()
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('No student object provided.');

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should fail to create student with missing keys', done => {
    // create random test student
    const TEST_STUDENT = createTestStudent() as Partial<Student>;

    // delete readingLevel key
    delete TEST_STUDENT.readingLevel;

    chai
      .request(server)
      .post('/student/')
      .send(TEST_STUDENT)
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Missing keys: readingLevel. ');

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should get all students', done => {
    // test request
    chai
      .request(server)
      .get('/allStudents')
      .send()
      .then(res => {
        // check for response
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');

        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
