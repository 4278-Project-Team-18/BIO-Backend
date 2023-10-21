import mongoose, { Schema } from 'mongoose';

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;
