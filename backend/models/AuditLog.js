// backend/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  totalRowsProcessed: { type: Number, required: true },
  complianceStandard: { type: String, default: 'GDPR / DPDP Compliant' },
  status: { type: String, default: 'SUCCESS' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);    