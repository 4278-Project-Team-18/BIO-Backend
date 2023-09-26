import { createTestClass, createTestStudent } from './testData/testData';
import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';

import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
import type { Student } from '../interfaces/student.interface';
import type { Server } from 'http';
import type { Class } from '../interfaces/class.interface';
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
  server = app.listen(6002);
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

describe('🧪 Test POST /class/', () => {
  it('should successfully create class', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // test request
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // check for keys
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('teacherId');

        // check for values
        expect(res.body.name).to.equal(TEST_CLASS.name);
        expect(res.body.teacherId).to.equal(TEST_CLASS.teacherId);

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should fail to create class with missing name', done => {
    // create random test class
    const TEST_CLASS = createTestClass() as Partial<Class>;
    delete TEST_CLASS.name;

    // test request
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Missing keys: name. ');

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should fail to create class when no class provided', done => {
    // test request
    chai
      .request(server)
      .post('/class/')
      .send()
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('No class object provided.');

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should get all classes', done => {
    // test request
    chai
      .request(server)
      .get('/class/allClasses/')
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

  it('should add a student to a class', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create random test student
    const TEST_STUDENT = createTestStudent();

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .then(res => {
            // check for response
            expect(res.status).to.equal(201);
            expect(res.body).to.be.an('object');

            // check for keys
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('name');
            expect(res.body).to.have.property('teacherId');
            expect(res.body).to.have.property('students');

            // check for values
            expect(res.body.name).to.equal(TEST_CLASS.name);
            expect(res.body.teacherId).to.equal(TEST_CLASS.teacherId);
            expect(res.body.students).to.be.an('array');
            expect(res.body.students.length).to.equal(1);

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

  it('should fail to add a student to a class when no student provided', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .send()
          .then(res => {
            // check for response
            expect(res.status).to.equal(400);
            expect(res.body).to.be.an('object');

            // check for error
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.equal('No student object provided.');

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

  it('should fail to add a student to a class when poorly formatted classId provided', done => {
    // create random test student
    const TEST_STUDENT = createTestStudent();

    // add student to class
    chai
      .request(server)
      .post(`/class/1234567890/addStudent`)
      .send(TEST_STUDENT)
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Invalid classId.');

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should fail to add student if keys are missing', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create random test student
    const TEST_STUDENT = createTestStudent() as Partial<Student>;
    delete TEST_STUDENT.firstName;

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .then(res => {
            // check for response
            expect(res.status).to.equal(400);
            expect(res.body).to.be.an('object');

            // check for error
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.equal('Missing keys: firstName. ');

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
});
