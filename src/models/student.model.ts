import mongoose, { Schema } from 'mongoose';

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastInitial: {
    type: String,
    required: true,
  },
  readingLevel: {
    type: String,
    required: true,
  },
  assignedBookLink: {
    type: String,
    default: '',
  },
  studentLetterLink: {
    type: String,
    default: '',
  },
  volunteerLetterLink: {
    type: String,
    default: '',
  },
  matchedVolunteer: {
    type: Schema.Types.ObjectId,
    ref: 'Volunteer',
  },
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
