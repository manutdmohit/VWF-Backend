const express = require('express');
const multer = require('multer');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage }).array('images', 10); // 'images' is the field name, 10 is the maximum number of files allowed

const {
  uploadImages,
  getAllImages,
  deleteImage,
} = require('../controllers/galleryController');
const { ensureAuthenticated } = require('../passportConfig');

const router = express.Router();

router
  .route('/')
  .post(ensureAuthenticated, upload, uploadImages)
  .get(getAllImages);

router.route('/:asset_id').delete(ensureAuthenticated, deleteImage);

module.exports = router;
