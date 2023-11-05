import adminRouter from '../routes/admin.router';
import studentRouter from '../routes/student.router';
import classRouter from '../routes/class.router';
import teacherRouter from '../routes/teacher.router';
import volunteerRouter from '../routes/volunteer.router';
import accountsRouter from '../routes/accounts.router';
import { inviteRouter, unprotectedInviteRouter } from '../routes/invite.router';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyparser from 'body-parser';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import morgan from 'morgan';
import http from 'http';

const createServer = () => {
  const app = express();

  // Middleware
  app.use(bodyparser.json({ limit: '5mb' }));
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // Logging
  if (process.env.ENVIRONMENT !== 'test') {
    app.use(morgan('dev'));
  }

  // Security
  app.use(helmet());
  app.disable('x-powered-by');

  // Routers
  if (process.env.ENVIRONMENT === 'test') {
    app.use('/admin', adminRouter);
    app.use('/student', studentRouter);
    app.use('/class', classRouter);
    app.use('/teacher', teacherRouter);
    app.use('/volunteer', volunteerRouter);
    app.use('/invite', inviteRouter);
    app.use('/unp-invite', unprotectedInviteRouter);
    app.use('/accounts', accountsRouter);
  } else {
    app.use('/admin', ClerkExpressRequireAuth({}), adminRouter);
    app.use('/student', ClerkExpressRequireAuth({}), studentRouter);
    app.use('/class', ClerkExpressRequireAuth({}), classRouter);
    app.use('/teacher', ClerkExpressRequireAuth({}), teacherRouter);
    app.use('/volunteer', ClerkExpressRequireAuth({}), volunteerRouter);
    app.use('/invite', ClerkExpressRequireAuth({}), inviteRouter);
    app.use('/unp-invite', unprotectedInviteRouter);
    app.use('/accounts', ClerkExpressRequireAuth({}), accountsRouter);
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  app.use((err: any, _: any, res: any, __: any) => {
    console.error(err.stack);
    res
      .status(403)
      .send({ message: "You're not authorized to access this endpoint!" });
  });

  // Create the server
  return http.createServer(app);
};

export default createServer;
