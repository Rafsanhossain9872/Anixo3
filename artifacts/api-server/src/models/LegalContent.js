import mongoose from 'mongoose';

const legalContentSchema = new mongoose.Schema({
  sectionId: { type: String, required: true, unique: true },
  title:     { type: String, required: true },
  content:   { type: String, default: '' },
  order:     { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('LegalContent', legalContentSchema);
