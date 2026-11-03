// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { Readable } = require('stream');
const csvParser = require('csv-parser');
const { maskData } = require('./utils/masker');
const AuditLog = require('./models/AuditLog');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vaultshield';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
  const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Signup
app.post('/api/v1/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    
    res.status(200).json({ success: true, message: 'Account created successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// Signin
app.post('/api/v1/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    res.status(200).json({ success: true, token: 'mock-jwt-token-vaultshield', email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signin.' });
  }
});

// Helper function to parse CSV buffers into JSON arrays
async function parseCsvBuffer(buffer) {
  const results = [];
  const stream = Readable.from(buffer.toString());
  
  return new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Endpoint to handle JSON or CSV uploads
app.post('/api/v1/sanitize', upload.single('file'), async (req, res) => {
  try {
    let rawData;
    let fileName = req.file ? req.file.originalname : 'inline_payload.json';

    if (req.file) {
      const fileExtension = fileName.split('.').pop().toLowerCase();

      if (fileExtension === 'json') {
        const fileContent = req.file.buffer.toString('utf8');
        rawData = JSON.parse(fileContent);
      } else if (fileExtension === 'csv') {
        rawData = await parseCsvBuffer(req.file.buffer);
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Please upload .json or .csv files.' });
      }
    } else if (req.body && Object.keys(req.body).length > 0) {
      rawData = req.body.data || req.body;
    } else {
      return res.status(400).json({ error: 'No file uploaded or payload provided.' });
    }

    const sanitizedData = maskData(rawData, strategy);
    const totalRows = Array.isArray(rawData) ? rawData.length : 1;
    const strategy = req.body.strategy || 'pseudonymize';
    

    // Save audit log to MongoDB
    const auditRecord = new AuditLog({
      fileName: fileName,
      totalRowsProcessed: totalRows,
      complianceStandard: 'GDPR & DPDP Act Verified',
      status: 'SUCCESS'
    });
    await auditRecord.save();

    res.status(200).json({
      success: true,
      message: 'Dataset successfully sanitized and logged.',
      totalRowsProcessed: totalRows,
      originalData: rawData,
      sanitizedData: sanitizedData,
      auditId: auditRecord._id,
      timestamp: auditRecord.timestamp
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'File parsing or sanitization error.' });
  }
});

// Endpoint to fetch historical audit logs
app.get('/api/v1/audits', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(10);
    res.status(200).json({ success: true, audits: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VaultShield Backend running on port ${PORT}`));