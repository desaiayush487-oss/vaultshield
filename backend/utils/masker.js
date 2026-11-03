// backend/utils/masker.js

const fakeFirstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Riley', 'Jamie'];
const fakeLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'];
const memoryMap = new Map();

function getDeterministicFakeName(originalValue) {
  if (memoryMap.has(originalValue)) return memoryMap.get(originalValue);
  const randomFirst = fakeFirstNames[Math.floor(Math.random() * fakeFirstNames.length)];
  const randomLast = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)];
  const fakeValue = `${randomFirst} ${randomLast}`;
  memoryMap.set(originalValue, fakeValue);
  return fakeValue;
}

function maskData(data, strategy = 'pseudonymize') {
  if (Array.isArray(data)) {
    return data.map(row => maskObject(row, strategy));
  } else if (typeof data === 'object' && data !== null) {
    return maskObject(data, strategy);
  }
  return data;
}

function maskObject(obj, strategy) {
  const maskedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (typeof value === 'string' && value.trim() !== '') {
      if (strategy === 'redact') {
        if (lowerKey.includes('email') || lowerKey.includes('phone') || lowerKey.includes('name') || lowerKey.includes('card')) {
          maskedObj[key] = '[REDACTED_PII]';
        } else {
          maskedObj[key] = value;
        }
      } else {
        // Pseudonymize strategy
        if (lowerKey.includes('email')) {
          maskedObj[key] = `user_${Math.floor(Math.random() * 10000)}@sandbox.test`;
        } else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
          maskedObj[key] = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
        } else if (lowerKey.includes('name')) {
          maskedObj[key] = getDeterministicFakeName(value);
        } else {
          maskedObj[key] = value;
        }
      }
    } else {
      maskedObj[key] = value;
    }
  }
  return maskedObj;
}

module.exports = { maskData };