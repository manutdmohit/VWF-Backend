const express = require('express');
const multer = require('multer');

const {
  addPost,
  getAllPosts,
  getPost,
  deletePost,
  deleteImage,
  updatePost,
} = require('../controllers/postController');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage }).array('images', 10); // 'images' is the field name, 10 is the maximum number of files allowed

const router = express.Router();

router.route('/').post(upload, addPost).get(getAllPosts);

router.route('/:id').get(getPost).patch(upload, updatePost).delete(deletePost);

router.delete('/:id/images/:assetId', deleteImage);

module.exports = router;
