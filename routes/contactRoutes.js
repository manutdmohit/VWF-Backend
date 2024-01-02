const express = require('express');
const {
  addContact,
  getAllContacts,
  deleteContact,
} = require('../controllers/contactController');

const { ensureAuthenticated } = require('../passportConfig');

const router = express.Router();

router.route('/').post(addContact).get(ensureAuthenticated, getAllContacts);

router.route('/:id').delete(ensureAuthenticated, deleteContact);

module.exports = router;
