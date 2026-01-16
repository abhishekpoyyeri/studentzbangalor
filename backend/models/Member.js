const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  memberId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  college: { type: String, required: true },
  email: { type: String, required: true },
  whatsapp: { type: String, required: true },
  photo: { type: String }, // base64 data URL or image path
  status: { type: String, default: 'Active Member' },
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);
