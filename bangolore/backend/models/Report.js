const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  referenceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  college: { type: String, required: true },
  email: { type: String },
  category: { type: String },
  details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
