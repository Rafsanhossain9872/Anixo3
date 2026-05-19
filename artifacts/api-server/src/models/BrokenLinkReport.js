import mongoose from 'mongoose';

const brokenLinkReportSchema = new mongoose.Schema({
  animeId:    { type: String, required: true },
  animeTitle: { type: String, default: '' },
  episode:    { type: Number, required: true },
  server:     { type: String, default: 'unknown' },
  isResolved: { type: Boolean, default: false },
  reportedAt: { type: Date, default: Date.now },
});

export default mongoose.model('BrokenLinkReport', brokenLinkReportSchema);
