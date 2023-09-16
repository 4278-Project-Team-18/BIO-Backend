import connectToMongoDB from './config/mongodb.config';
import adminRouter from './routes/admin.router';
import express from 'express';

// connect to mongo db
connectToMongoDB();

// create our server
const app = express();

app.use(express.json());

// define our port
const port = process.env.PORT || 3000;

app.use('/admin', adminRouter);

// start our server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
