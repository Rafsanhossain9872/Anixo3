import mongoose from 'mongoose';

const videoLinkSchema = new mongoose.Schema({
  animeId: { type: String, required: true },
  animeTitle: { type: String },
  episode: { type: Number, required: true },
  url: { type: String, required: true },
  quality: { type: String, default: '1080p' },
  type: { type: String, default: 'M3U8' },
  updatedAt: { type: Date, default: Date.now },
});

videoLinkSchema.index({ animeId: 1, episode: 1 }, { unique: true });

export default mongoose.model('VideoLink', videoLinkSchema);
