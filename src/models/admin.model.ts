import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
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
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
