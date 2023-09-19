import adminRouter from '../routes/admin.router';
import studentRouter from '../routes/student.router';
import classRouter from '../routes/class.router';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
  app.use('/admin', adminRouter);
  app.use('/student', studentRouter);
  app.use('/class', classRouter);

  // Create the server
  return http.createServer(app);
};

export default createServer;
