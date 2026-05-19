import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  name:      { type: String, required: true, maxlength: 100 },
  email:     { type: String, required: true, maxlength: 200 },
  subject:   { type: String, required: true, maxlength: 200 },
  message:   { type: String, required: true, maxlength: 5000 },
  isRead:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('SupportTicket', supportTicketSchema);
