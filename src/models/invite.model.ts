import mongoose, { Schema } from 'mongoose';

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
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
