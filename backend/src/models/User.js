import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  airtableUserId: { type: String, index: true },
  email: String,
  name: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Date,
}, { timestamps: true });

export default mongoose.model('User', userSchema);
