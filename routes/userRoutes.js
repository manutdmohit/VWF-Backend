const express = require('express');
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
} = require('../controllers/userController');

const { ensureAuthenticated, isAuthenticated } = require('../passportConfig');

const router = express.Router();

router
  .route('/')
  .post(isAuthenticated, createUser)
  .get(isAuthenticated, getAllUsers);

router.post('/all', isAuthenticated, getUsers);

router
  .route('/:id')
  .get(isAuthenticated, getUser)
  .patch(isAuthenticated, updateUser)
  .delete(isAuthenticated, deleteUser);

module.exports = router;
