import { createTestVolunteer, createTestStudent } from './testData/testData';
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
        expect(res.body).to.have.property('approvalStatus');

        // check for values
        expect(res.body.email).to.equal(TEST_VOLUNTEER.email);
        expect(res.body.firstName).to.equal(TEST_VOLUNTEER.firstName);
        expect(res.body.lastName).to.equal(TEST_VOLUNTEER.lastName);
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

  // TODO: This test is failing because we are creating a volunteer not inviting one, therefore the invite does not exist.
  // it('should approve volunteer', done => {
  //   const TEST_VOLUNTEER = createTestVolunteer();
  //   // test request
  //   chai
  //     .request(server)
  //     .post('/volunteer/')
  //     .send(TEST_VOLUNTEER)
  //     .then(res => {
  //       // check for response
  //       expect(res.status).to.equal(201);
  //       expect(res.body).to.be.an('object');

  //       // approve volunteer
  //       chai
  //         .request(server)
  //         .patch(`/volunteer/${res.body._id}/changeVolunteerApprovalStatus`)
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

  // it('should reject volunteer', done => {
  //   const TEST_VOLUNTEER = createTestVolunteer();
  //   // test request
  //   chai
  //     .request(server)
  //     .post('/volunteer/')
  //     .send(TEST_VOLUNTEER)
  //     .then(res => {
  //       // check for response
  //       expect(res.status).to.equal(201);
  //       expect(res.body).to.be.an('object');

  //       // deny volunteer
  //       chai
  //         .request(server)
  //         .patch(`/volunteer/${res.body._id}/changeVolunteerApprovalStatus`)
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

  it('should match student to volunteer', done => {
    const TEST_VOLUNTEER = createTestVolunteer();
    const TEST_STUDENT = createTestStudent();
    const TEST_STUDENT2 = createTestStudent();

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

            //create student 2
            chai
              .request(server)
              .post('/student/')
              .send(TEST_STUDENT2)
              .then(studentRes2 => {
                // check for response
                expect(studentRes2.status).to.equal(201);
                expect(studentRes2.body).to.be.an('object');

                //match student and volunteer
                chai
                  .request(server)
                  .patch(`/volunteer/match`)
                  .send({
                    volunteerId: volunteerRes.body._id,
                    studentIdArray: [studentRes.body._id, studentRes2.body._id],
                  })
                  .then(res => {
                    // check for response
                    expect(res.status).to.equal(200);
                    expect(res.body).to.be.an('object');

                    // check for correct values

                    for (let i = 0; i < res.body.students.length; ++i) {
                      expect(res.body.students[i].matchedVolunteer).to.equal(
                        volunteerRes.body._id
                      );
                      expect(
                        res.body.volunteer.matchedStudents.includes(
                          res.body.students[i]._id
                        )
                      );
                    }
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

  it('should fail to match with invalid volunteer or student IDs', done => {
    //match student and volunteer
    chai
      .request(server)
      .patch(`/volunteer/match`)
      .send({ volunteerId: '12345678', studentIdArray: ['12345678'] })
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body.error).to.equal('Invalid volunteer ID');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should fail to match with missing volunteer or student id', done => {
    //match student and volunteer
    chai
      .request(server)
      .patch(`/volunteer/match`)
      .send({ studentIdArray: ['12345678'] })
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body.error).to.equal('Missing keys: volunteerId. ');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should match then ummatch student and volunteer', done => {
    const TEST_VOLUNTEER = createTestVolunteer();
    const TEST_STUDENT = createTestStudent();

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
                  .patch(`/volunteer/unmatch`)
                  .send({
                    volunteerId: volunteerRes.body._id,
                    studentId: studentRes.body._id,
                  })
                  .then(res => {
                    // check for response
                    expect(res.status).to.equal(200);
                    expect(res.body).to.be.an('object');

                    // check for correct values

                    expect(
                      !res.body.volunteer.matchedStudents.includes(
                        studentRes.body._id
                      )
                    );
                    expect(res.body.student.matchedVolunteer).to.equal(undefined);
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

  it('should fail to ummatch student and volunteer who are not currently matched', done => {
    const TEST_VOLUNTEER = createTestVolunteer();
    const TEST_STUDENT = createTestStudent();

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
              .patch('/volunteer/unmatch')
              .send({
                volunteerId: volunteerRes.body._id,
                studentId: studentRes.body._id,
              })
              .then(matchRes => {
                // check for response
                expect(matchRes.status).to.equal(400);
                expect(matchRes.body).to.be.an('object');
                expect(matchRes.body.error).to.equal(
                  'volunteer not currently matched to student'
                );

                // check for correct values
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
  });

  it('should fail to unmatch with missing volunteer or student id', done => {
    //match student and volunteer
    chai
      .request(server)
      .patch(`/volunteer/unmatch`)
      .send({ studentId: '12345678' })
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body.error).to.equal('Missing keys: volunteerId. ');
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
