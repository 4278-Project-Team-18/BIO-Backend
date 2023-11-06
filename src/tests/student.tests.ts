import { createTestStudent, createTestVolunteer } from './testData/testData';
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
      .get('/student/')
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

describe('🧪 Test PATCH /student/:studentId ', () => {
  it('should successfully update student', done => {
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

        // update test student
        TEST_STUDENT.firstName = 'UPDATED';

        // test request
        chai
          .request(server)
          .patch(`/student/${res.body._id}`)
          .send(TEST_STUDENT)
          .then(nextRes => {
            // check for response
            expect(nextRes.status).to.equal(200);
            expect(nextRes.body).to.be.an('object');

            // check for keys
            expect(nextRes.body).to.have.property('_id');
            expect(nextRes.body).to.have.property('firstName');
            expect(nextRes.body).to.have.property('lastInitial');
            expect(nextRes.body).to.have.property('readingLevel');

            // check for values
            expect(nextRes.body.firstName).to.equal(TEST_STUDENT.firstName);
            expect(nextRes.body.lastInitial).to.equal(TEST_STUDENT.lastInitial);
            expect(nextRes.body.readingLevel).to.equal(TEST_STUDENT.readingLevel);

            // end test
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

  it('should return 400 if no student id provided', done => {
    // create random test student
    const TEST_STUDENT = createTestStudent();

    chai
      .request(server)
      .patch('/student/BAD')
      .send(TEST_STUDENT)
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Invalid student ID.');

        // end test
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});

describe('🧪 Test student letter upload', () => {
  it('should successfully create student and upload test', done => {
    // create random test student
    const TEST_STUDENT = createTestStudent();
    TEST_STUDENT.firstName = 'TEST';
    TEST_STUDENT.lastInitial = 'TEST';

    // create student
    chai
      .request(server)
      .post('/student/')
      .send(TEST_STUDENT)
      .then(studentRes => {
        // check for response
        expect(studentRes.status).to.equal(201);
        expect(studentRes.body).to.be.an('object');
        chai
          .request(server)
          .post(`/student/${studentRes.body._id}/uploadStudentLetter`)
          .attach('file', __dirname + '/chai-test.pdf', 'chai-test.pdf')
          .then(res => {
            // check for response
            expect(res.status).to.equal(201);
            expect(res.body).to.be.an('object');
            // check for matching fields
            expect(res.body.body.Location).to.equal(
              res.body.student.studentLetterLink
            );
            // end test
            done();
          })
          .catch(err => {
            console.log(err);
            done(err);
          });
      })
      .catch(err => {
        done(err);
      });
  });

  it("should create a student, a volunteer, match them, then upload a volunteer's letter", done => {
    const TEST_VOLUNTEER = createTestVolunteer();
    const TEST_STUDENT = createTestStudent();
    TEST_VOLUNTEER.firstName = 'TEST_VOLUNTEER';
    TEST_VOLUNTEER.lastName = 'TESTMAN';
    TEST_STUDENT.firstName = 'TEST_STUDENT';
    TEST_STUDENT.lastInitial = 'T';

    // create volunteer
    chai
      .request(server)
      .post('/volunteer/')
      .send(TEST_VOLUNTEER)
      .then(volunteerRes => {
        // check for response
        expect(volunteerRes.status).to.equal(201);
        expect(volunteerRes.body).to.be.an('object');

        //create student
        chai
          .request(server)
          .post('/student/')
          .send(TEST_STUDENT)
          .then(studentRes => {
            // check for response
            expect(studentRes.status).to.equal(201);
            expect(studentRes.body).to.be.an('object');

            //match student and volunteer
            chai
              .request(server)
              .patch('/volunteer/match')
              .send({
                volunteerId: volunteerRes.body._id,
                studentIdArray: [studentRes.body._id],
              })
              .then(matchRes => {
                // check for response
                expect(matchRes.status).to.equal(200);
                expect(matchRes.body).to.be.an('object');

                // check for correct values

                for (let i = 0; i < matchRes.body.students.length; ++i) {
                  expect(matchRes.body.students[i].matchedVolunteer).to.equal(
                    volunteerRes.body._id
                  );
                  expect(
                    matchRes.body.volunteer.matchedStudents.includes(
                      matchRes.body.students[i]._id
                    )
                  );
                }

                //match student and volunteer
                chai
                  .request(server)
                  .post(`/student/${studentRes.body._id}/uploadVolunteerLetter`)
                  .field('volunteerId', volunteerRes.body._id)
                  .attach('file', __dirname + '/chai-test.pdf', 'chai-test.pdf')
                  .then(res => {
                    // check for response
                    console.log(res);
                    expect(res.body).to.be.an('array');
                    expect(res.status).to.equal(201);

                    // check for matching fields
                    expect(res.body.body.Location).to.equal(
                      res.body.student.volunteerLetterLink
                    );
                    // end test
                    done();
                  })
                  .catch(err => {
                    done(err);
                  });
              })
              .catch(err => {
                done(err);
              });
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
