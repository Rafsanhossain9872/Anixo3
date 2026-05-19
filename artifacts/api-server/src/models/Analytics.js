import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  animeId:    { type: String, required: true, unique: true },
  animeTitle: { type: String, default: "" },
  views:      { type: Number, default: 0 },
  lastViewed: { type: Date,   default: Date.now },
});

export default mongoose.model('Analytics', analyticsSchema);
