const express = require('express');
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
} = require('../controllers/userController');

const { ensureAuthenticated } = require('../passportConfig');

const router = express.Router();

router
  .route('/')
  .post(ensureAuthenticated, createUser)
  .get(ensureAuthenticated, getAllUsers);

router.post('/all', ensureAuthenticated, getUsers);

router
  .route('/:id')
  .get(ensureAuthenticated, getUser)
  .patch(ensureAuthenticated, updateUser)
  .delete(ensureAuthenticated, deleteUser);

module.exports = router;
