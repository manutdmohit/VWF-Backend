const express = require('express');
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  updateUserPassword,
} = require('../controllers/userController');

const { ensureAuthenticated } = require('../passportConfig');

const router = express.Router();

router
  .route('/')
  .post(ensureAuthenticated, createUser)
  .get(ensureAuthenticated, getAllUsers);

router.post('/all', ensureAuthenticated, getUsers);

router.patch('/updatepassword', ensureAuthenticated, updateUserPassword);

router
  .route('/:id')
  .get(ensureAuthenticated, getUser)
  .patch(ensureAuthenticated, updateUser)
  .delete(ensureAuthenticated, deleteUser);

module.exports = router;
