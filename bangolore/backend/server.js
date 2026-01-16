require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Report = require('./models/Report');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentz-bangalore';
const PORT = process.env.PORT || 4000;

// Utility to create a short reference id
function randomId() {
  const ts = Date.now().toString(36).slice(-5);
  const r = Math.random().toString(36).slice(2, 7);
  return `SB-${ts}-${r}`.toUpperCase();
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err.message || err);
  process.exit(1);
});

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Create a report
app.post('/api/reports', async (req, res) => {
  try {
    const { name, college, email, category, details } = req.body;
    if (!name || !college || !details) {
      return res.status(400).json({ error: 'name, college and details are required' });
    }
    const report = new Report({
      referenceId: randomId(),
      name,
      college,
      email,
      category,
      details,
    });
    await report.save();
    res.status(201).json({ ok: true, report });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(500).json({ error: 'Duplicate reference ID, try again' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// List reports (basic)
app.get('/api/reports', async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const reports = await Report.find().sort({ createdAt: -1 }).limit(limit);
    res.json({ ok: true, count: reports.length, reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
