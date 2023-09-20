import connectToMongoDB from './config/mongodb.config';
import createServer from './config/server.config';

// connect to mongo db
connectToMongoDB();

// create our server
const app = createServer();

// define our port
const port = process.env.PORT || 3000;

// start our server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
