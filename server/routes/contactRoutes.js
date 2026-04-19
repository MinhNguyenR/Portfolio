const express = require('express');
const router = express.Router();
const { submitContact, getContacts } = require('../controllers/contactController');
const adminAuth = require('../middleware/adminAuth');

router.post('/', submitContact);
router.get('/', adminAuth, getContacts);

module.exports = router;
