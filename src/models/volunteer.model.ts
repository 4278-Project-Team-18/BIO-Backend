import mongoose, { Schema } from 'mongoose';

const volunteerSchema = new mongoose.Schema({
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
    default: '',
  },
  password: {
    type: String,
    required: true,
    default: '',
  },
  matchedStudents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;
