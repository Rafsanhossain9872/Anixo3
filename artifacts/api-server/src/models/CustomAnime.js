import mongoose from 'mongoose';

const customAnimeSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, unique: true, sparse: true },
  bannerImage: { type: String },
  coverImage:  { type: String },
  genres:      [{ type: String }],
  description: { type: String },
  episodes:    { type: Number, default: 0 },
  status:      { type: String, default: 'RELEASING' },
  ep1Url:      { type: String },
  createdAt:   { type: Date, default: Date.now },
});

export default mongoose.model('CustomAnime', customAnimeSchema);
