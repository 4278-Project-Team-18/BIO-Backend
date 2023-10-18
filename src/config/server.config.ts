import adminRouter from '../routes/admin.router';
import studentRouter from '../routes/student.router';
import classRouter from '../routes/class.router';
import teacherRouter from '../routes/teacher.router';
import volunteerRouter from '../routes/volunteer.router';
import inviteRouter from '../routes/invite.router';
import accountsRouter from '../routes/accounts.router';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import http from 'http';

const createServer = () => {
  const app = express();

  // Middleware
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // Security
  app.use(helmet());
  app.disable('x-powered-by');

  // Routers
  app.use('/admin', ClerkExpressRequireAuth({}), adminRouter);
  app.use('/student', ClerkExpressRequireAuth({}), studentRouter);
  app.use('/class', ClerkExpressRequireAuth({}), classRouter);
  app.use('/teacher', ClerkExpressRequireAuth({}), teacherRouter);
  app.use('/volunteer', ClerkExpressRequireAuth({}), volunteerRouter);
  app.use('/invite', ClerkExpressRequireAuth({}), inviteRouter);
  app.use('/accounts', ClerkExpressRequireAuth({}), accountsRouter);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  app.use((err: any, _: any, res: any, __: any) => {
    console.error(err.stack);
    res.status(403).send('Unauthenticated!');
  });

  // Create the server
  return http.createServer(app);
};

export default createServer;
