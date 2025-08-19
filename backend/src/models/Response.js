import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payload: mongoose.Schema.Types.Mixed,
  airtableResponse: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['pending', 'sent', 'error'], default: 'pending' },
  error: String,
}, { timestamps: true });

export default mongoose.model('Response', responseSchema);
