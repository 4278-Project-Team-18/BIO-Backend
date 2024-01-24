import connectToMongoDB from './config/mongodb.config';
import createServer from './config/server.config';
import logger from './config/logger.config';
import type { StrictAuthProp } from '@clerk/clerk-sdk-node';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

// connect to mongo db
connectToMongoDB();

// create our server
const app = createServer();

// define our port
const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || '0.0.0.0';

logger.info('PORT: ', port, 'HOST: ', host);

// start our server
app.listen(port, host, undefined, () => {
  logger.info(`Server started on port ${port}`);
});
