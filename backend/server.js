require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Report = require('./models/Report');
const Member = require('./models/Member');

const app = express();
app.use(cors());
// Allow larger JSON payloads (base64 images) and urlencoded bodies
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Handle large payload errors
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  next(err);
});

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

// Create a community member
app.post('/api/members', async (req, res) => {
  try {
    const { name, college, email, whatsapp, photo } = req.body;
    if (!name || !college || !email || !whatsapp) {
      return res.status(400).json({ error: 'name, college, email and whatsapp are required' });
    }
    const member = new Member({
      memberId: `SB${new Date().getFullYear()}${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      name,
      college,
      email,
      whatsapp,
      photo,
    });
    await member.save();
    res.status(201).json({ ok: true, member });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(500).json({ error: 'Duplicate member ID, try again' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// List members
app.get('/api/members', async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
    const members = await Member.find().sort({ createdAt: -1 }).limit(limit);
    res.json({ ok: true, count: members.length, members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using it or change PORT.`);
    process.exit(1);
  }
  console.error(err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
