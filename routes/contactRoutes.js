const express = require('express');
const {
  addContact,
  getAllContacts,
} = require('../controllers/contactController');

const { ensureAuthenticated } = require('../passportConfig');

const router = express.Router();

router.route('/').post(addContact).get(getAllContacts);

module.exports = router;
