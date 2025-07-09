// routes/webhook.js
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const router = express.Router();

router.post(
  '/cashfree',
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    try {
      console.log('\n Webhook route hit');

      const receivedSignature = req.headers['x-webhook-signature'];
      if (!receivedSignature) {
        console.log('Signature missing in headers');
        return res.status(400).send('Missing signature');
      }

      const rawPayload = req.body.toString('utf-8');

      // Save raw body to file for testing
      fs.writeFileSync('raw-payload.txt', rawPayload);

      // Generate signature
      const generatedSignature = crypto
        .createHash('sha256')
        .update(rawPayload)
        .digest('base64');

      console.log('Received Signature :', receivedSignature);
      console.log('Generated Signature:', generatedSignature);

      if (receivedSignature !== generatedSignature) {
        console.log('Signature mismatch!');
        return res.status(403).send('Invalid signature');
      }

      console.log('Signature matched!');
      res.status(200).send('Webhook verified');
    } catch (err) {
      console.error('Error in webhook:', err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;


