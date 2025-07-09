const crypto = require('crypto');
const fs = require('fs');

// ✅ Use raw-payload.txt saved from webhook
const rawPayload = fs.readFileSync('raw-payload.txt', 'utf-8');

// ✅ Signature from 'x-webhook-signature' header
const receivedSignature = 'D7JbzAFXtOmbhXdJLTrI63n6GU93Ekgm1mBp8V6SKfo=';

const generatedSignature = crypto
  .createHash('sha256')
  .update(rawPayload)
  .digest('base64');

console.log('📬 Received Signature :', receivedSignature);
console.log('🔑 Generated Signature:', generatedSignature);

if (generatedSignature === receivedSignature) {
  console.log('✅ Signature matched! Webhook is verified.');
} else {
  console.log('❌ Signature mismatch! Webhook is invalid.');
}


