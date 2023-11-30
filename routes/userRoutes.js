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

router.route('/').post(createUser).get(getAllUsers);

router.post('/all', getUsers);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
