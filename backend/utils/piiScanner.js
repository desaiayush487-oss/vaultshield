// backend/utils/piiScanner.js

const piiRegex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, // Indian & general mobile patterns
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6011[0-9]{12}|3[47][0-9]{13})$/,
};

const sensitiveKeys = ['password', 'secret', 'ssn', 'pan', 'aadhar', 'credit_card', 'phone', 'email', 'name', 'address'];

function detectPII(key, value) {
  const lowerKey = key.toLowerCase();
  
  // Check if key matches sensitive terms
  const isSensitiveKey = sensitiveKeys.some(term => lowerKey.includes(term));
  
  if (typeof value === 'string') {
    if (piiRegex.email.test(value)) return { type: 'EMAIL', detected: true };
    if (piiRegex.phone.test(value)) return { type: 'PHONE', detected: true };
    if (piiRegex.creditCard.test(value)) return { type: 'CREDIT_CARD', detected: true };
  }

  if (isSensitiveKey) {
    return { type: 'SENSITIVE_FIELD', detected: true };
  }

  return { detected: false };
}

module.exports = { detectPII };