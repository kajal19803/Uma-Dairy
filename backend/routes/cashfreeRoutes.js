const express = require('express');
const router = express.Router();
const { createPaymentLink } = require('../controllers/cashfreeController');

router.post('/create-link', createPaymentLink);

module.exports = router;
