import mongoose, { Schema } from 'mongoose';

const classSchema = new mongoose.Schema({
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  estimatedDelivery: {
    type: String,
    default: '',
  },
});

const Class = mongoose.model('Class', classSchema);

export default Class;
