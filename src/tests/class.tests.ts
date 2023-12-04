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
  //[ADMIN ROLE SUCCESS] testing normal create class functionality with admin role
  it('should successfully create class using admin role', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // test request
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .set('role', 'admin')
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // check for keys
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name');

        // check for values
        expect(res.body.name).to.equal(TEST_CLASS.name);

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  //[TEACHER ROLE SUCCESS] testing normal create class functionality with teacher role
  it('should successfully create class using teacher role', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // test request
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .set('role', 'teacher')
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // check for keys
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name');

        // check for values
        expect(res.body.name).to.equal(TEST_CLASS.name);

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  //[VOLUNTEER ROLE FAILURE] testing failing case of create class when using volunteer role
  it('should forbid class creation with volunteer role', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // test request
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .set('role', 'volunteer')
      .then(res => {
        // check for response
        expect(res.status).to.equal(403);
        expect(res.body).to.be.an('object');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  //[REQUEST FORMAT FAILURE]
  it('should fail to create class with missing name', done => {
    // create random test class
    const TEST_CLASS = createTestClass() as Partial<Class>;
    delete TEST_CLASS.name;

    // test request
    chai
      .request(server)
      .post('/class/')
      .set('role', 'admin')
      .send(TEST_CLASS)
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

  //[REQUEST FORMAT FAILURE]
  it('should fail to create class when no class provided', done => {
    // test request
    chai
      .request(server)
      .post('/class/')
      .set('role', 'admin')
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

  //[ADMIN ROLE SUCCESS]successful get all classes using admin role
  it('should get all classes using admin role', done => {
    // test request
    chai
      .request(server)
      .get('/class/')
      .set('role', 'admin')
      .set('email', '')
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

  //[TEACHER ROLE SUCCESS] successful get class using teacher role
  // it('should get all classes using teacher role', done => {
  //   // test request
  //   chai
  //     .request(server)
  //     .get('/class/')
  //     .set('role', 'teacher')
  //     .set('email', 'admn.cwrubio@gmail.com')
  //     .then(res => {
  //       // check for response
  //       expect(res.status).to.equal(200);
  //       expect(res.body).to.be.an('array');

  //       /******
  //        *
  //       have to write additional logic here to check that only classes belonging to this teacher are returned

  //       */
  //       done();
  //     })
  //     .catch(err => {
  //       done(err);
  //     });
  // });

  //[VOLUNTEER ROLE FAILURE] fail to get all classes using volunteer role
  it('should get all classes using volunteer role', done => {
    // test request
    chai
      .request(server)
      .get('/class/')
      .set('role', 'volunteer')
      .then(res => {
        // check for response
        expect(res.status).to.equal(403);
        expect(res.body).to.be.an('object');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  //[ADMIN ROLE SUCCESS] successfully add student to class as an admin
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
      .set('role', 'admin')
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .set('role', 'admin')
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

  //[TEACHER ROLE SUCCESS] successfully add student to class as teacher
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
      .set('role', 'admin')
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .set('role', 'teacher')
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

  //[VOLUNTEER ROLE FAILURE] fail to add student to class as a volunteer
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
      .set('role', 'admin') //has to set role as admin for creating the class
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .set('role', 'volunteer')
          .then(res => {
            // check for response
            expect(res.status).to.equal(403);
            expect(res.body).to.be.an('object');
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

  //[REQUEST FORMAT FAILURE]
  it('should fail to add a student to a class when no student provided', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create class
    chai
      .request(server)
      .post('/class/')
      .set('role', 'admin')
      .send(TEST_CLASS)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .set('role', 'admin')
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

  //[REQUEST FORMAT FAILURE]
  it('should fail to add a student to a class when poorly formatted classId provided', done => {
    // create random test student
    const TEST_STUDENT = createTestStudent();

    // add student to class
    chai
      .request(server)
      .post(`/class/1234567890/addStudent`)
      .set('role', 'teacher')
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

  //[REQUEST FORMAT FAILURE]
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
      .set('role', 'admin')
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res.body._id}/addStudent`)
          .set('role', 'admin')
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

describe('🧪 Test DELETE /class/:classId/removeStudent/:studentId', () => {
  //[ADMIN ROLE SUCCESS] admin success remove student from class
  it('should successfully remove student from class', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create random test student
    const TEST_STUDENT = createTestStudent();

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .set('role', 'admin')
      .then(res1 => {
        // check for response
        expect(res1.status).to.equal(201);
        expect(res1.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res1.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .set('role', 'admin')
          .then(res2 => {
            // check for response
            expect(res2.status).to.equal(201);
            expect(res2.body).to.be.an('object');

            // remove student from class
            chai
              .request(server)
              .delete(`/class/${res1.body._id}/removeStudent/`)
              .send({ studentId: res2.body._id })
              .set('role', 'admin')
              .then(res3 => {
                // check for response
                expect(res3.status).to.equal(200);
                expect(res3.body).to.be.an('object');

                // check for keys
                expect(res3.body).to.have.property('message');
                expect(res3.body.message).to.equal(
                  'Successfully removed student.'
                );

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

  //[TEACHER ROLE SUCCESS] teacher successfully remove student from class
  it('should successfully remove student from class', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create random test student
    const TEST_STUDENT = createTestStudent();

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .set('role', 'teacher')
      .then(res1 => {
        // check for response
        expect(res1.status).to.equal(201);
        expect(res1.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res1.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .set('role', 'teacher')
          .then(res2 => {
            // check for response
            expect(res2.status).to.equal(201);
            expect(res2.body).to.be.an('object');

            // remove student from class
            chai
              .request(server)
              .delete(`/class/${res1.body._id}/removeStudent/`)
              .send({ studentId: res2.body._id })
              .set('role', 'teacher')
              .then(res3 => {
                // check for response
                expect(res3.status).to.equal(200);
                expect(res3.body).to.be.an('object');

                // check for keys
                expect(res3.body).to.have.property('message');
                expect(res3.body.message).to.equal(
                  'Successfully removed student.'
                );

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

  //[VOLUNTEER ROLE FAILURE] volunteer fail to remove student from class
  it('should successfully remove student from class', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create random test student
    const TEST_STUDENT = createTestStudent();

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .set('role', 'admin')
      .then(res1 => {
        // check for response
        expect(res1.status).to.equal(201);
        expect(res1.body).to.be.an('object');

        // add student to class
        chai
          .request(server)
          .post(`/class/${res1.body._id}/addStudent`)
          .send(TEST_STUDENT)
          .set('role', 'admin')
          .then(res2 => {
            // check for response
            expect(res2.status).to.equal(201);
            expect(res2.body).to.be.an('object');

            // remove student from class
            chai
              .request(server)
              .delete(`/class/${res1.body._id}/removeStudent/`)
              .send({ studentId: res2.body._id })
              .set('role', 'volunteer')
              .then(res3 => {
                // check for response
                expect(res3.status).to.equal(403);
                expect(res3.body).to.be.an('object');
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

  //[REQUEST FORMAT FAILURE]
  it('should fail to remove student from class when poorly formatted id provided', done => {
    // remove student from class
    chai
      .request(server)
      .delete(`/class/345678/removeStudent/`)
      .set('role', 'admin')
      .send({ studentId: `${new mongoose.Types.ObjectId().toString()}` })
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
});

describe('🧪 Test PATCH /class/:classId/updateEstimatedDelivery', () => {
  it('should successfully update estimated delivery date', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .then(res1 => {
        // check for response
        expect(res1.status).to.equal(201);
        expect(res1.body).to.be.an('object');

        // make request to add delivery date
        chai
          .request(server)
          .patch(`/class/${res1.body._id}/updateEstimatedDelivery`)
          .send({
            newEstimatedDelivery: '18-4-23',
          })
          .then(res2 => {
            // check for response
            expect(res2.status).to.equal(200);
            expect(res2.body).to.be.an('object');
            expect(res2.body.class.estimatedDelivery).to.equal('18-4-23');
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

  it('should fail to update estimated delivery date without providing new date', done => {
    // create random test class
    const TEST_CLASS = createTestClass();

    // create class
    chai
      .request(server)
      .post('/class/')
      .send(TEST_CLASS)
      .then(res1 => {
        // check for response
        expect(res1.status).to.equal(201);
        expect(res1.body).to.be.an('object');

        // make update delivery request and check that it fails
        chai
          .request(server)
          .patch(`/class/${res1.body._id}/updateEstimatedDelivery`)
          .send({})
          .then(res2 => {
            // check for response
            expect(res2.status).to.equal(400);
            expect(res2.body).to.be.an('object');
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
