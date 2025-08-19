import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  airtableFieldId: String,
  label: String,
  type: String,
  required: Boolean,
  options: mongoose.Schema.Types.Mixed,
}, { _id: false });

const formSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: String,
  baseId: String,
  tableId: String,
  fields: [fieldSchema],
  logic: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.model('Form', formSchema);
