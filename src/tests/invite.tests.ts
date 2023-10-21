import { createTestInvite } from './testData/testData';
import createServer from '../config/server.config';
import { connectTestsToMongo } from '../util/tests.util';
import { InviteStatus } from '../interfaces/invite.interface';
import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
import type { Invite } from '../interfaces/invite.interface';
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
  server = app.listen(6005);
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

describe('🧪 Test POST /invite/', () => {
  it('should successfully create invite', done => {
    // create random test invite
    const TEST_INVITE = createTestInvite();

    // test request
    chai
      .request(server)
      .post('/invite/sendInvite')
      .send(TEST_INVITE)
      .then(res => {
        // check for response
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');

        // check for keys
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('email');
        expect(res.body).to.have.property('role');
        expect(res.body).to.have.property('status');

        // check for values
        expect(res.body.email).to.equal(TEST_INVITE.email);
        expect(res.body.role).to.equal(TEST_INVITE.role);
        expect(res.body.status).to.equal(InviteStatus.SENT);

        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should fail to create invite with missing email', done => {
    // create random test invite
    const TEST_INVITE = createTestInvite() as Partial<Invite>;
    delete TEST_INVITE.email;

    // test request
    chai
      .request(server)
      .post('/invite/sendInvite')
      .send(TEST_INVITE)
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Missing keys: email. ');

        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should fail to create invite with no body', done => {
    // test request
    chai
      .request(server)
      .post('/invite/sendInvite')
      .send()
      .then(res => {
        // check for response
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');

        // check for error
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('No invite object provided.');

        done();
      })
      .catch(error => {
        done(error);
      });
  });
});

describe('🧪 Test GET /unp-invite/:inviteId', () => {
  it('should successfully get invite', done => {
    chai
      .request(server)
      .post('/invite/sendInvite')
      .send(createTestInvite())
      .then(res => {
        const inviteId = res.body._id;
        chai
          .request(server)
          .get(`/unp-invite/${inviteId}`)
          .then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('email');
            expect(res.body).to.have.property('role');
            expect(res.body).to.have.property('status');
            done();
          })
          .catch(error => {
            done(error);
          });
      });
  });

  it('should fail to get invite with invalid inviteId', done => {
    chai
      .request(server)
      .get('/unp-invite/123')
      .then(res => {
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Invalid inviteId.');
        done();
      })
      .catch(error => {
        done(error);
      });
  });
});

describe('🧪 Test DELETE /invite/:inviteId', () => {
  it('should successfully delete invite', done => {
    chai
      .request(server)
      .post('/invite/sendInvite')
      .send(createTestInvite())
      .then(res => {
        const inviteId = res.body._id;
        chai
          .request(server)
          .delete(`/invite/${inviteId}`)
          .then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('email');
            expect(res.body).to.have.property('role');
            expect(res.body).to.have.property('status');
            done();
          })
          .catch(error => {
            done(error);
          });
      });
  });

  it('should fail to delete invite with invalid inviteId', done => {
    chai
      .request(server)
      .delete('/invite/123')
      .then(res => {
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.equal('Invalid inviteId.');
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should fail to delete invite with no inviteId', done => {
    chai
      .request(server)
      .delete('/invite/')
      .then(res => {
        expect(res.status).to.equal(404);
        done();
      })
      .catch(error => {
        done(error);
      });
  });
});

describe('🧪 Test GET /invite/allInvites', () => {
  it('should successfully get all invites', done => {
    const TEST_INVITE = createTestInvite();

    chai
      .request(server)
      .post('/invite/sendInvite')
      .send(TEST_INVITE)
      .then(res => {
        expect(res.status).to.equal(201);

        chai
          .request(server)
          .get(`/invite/`)
          .then(res1 => {
            expect(res1.status).to.equal(200);
            expect(res1.body).to.be.an('array');
            expect(res1.body[0]).to.have.property('_id');
            expect(res1.body[0]).to.have.property('email');
            expect(res1.body[0]).to.have.property('role');
            expect(res1.body[0]).to.have.property('status');
            done();
          })
          .catch(error => {
            done(error);
          });
      })
      .catch(error => {
        done(error);
      });
  });
});
