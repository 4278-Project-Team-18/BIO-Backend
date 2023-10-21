import mongoose, { Schema } from 'mongoose';

const teacherSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true, // no duplicate emails
    required: true,
  },
  approvalStatus: {
    type: String,
    required: true,
  },
  classes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
  ],
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
