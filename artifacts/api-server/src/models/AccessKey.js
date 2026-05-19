import mongoose from 'mongoose';

const accessKeySchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true },
  isUsed:    { type: Boolean, default: false },
  isRevoked: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AccessKey', accessKeySchema);
