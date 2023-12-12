const { StatusCodes } = require('http-status-codes');
const cloudinary = require('cloudinary').v2;

const Gallery = require('../models/Gallery');

const pLimit = require('p-limit');

exports.uploadImages = async (req, res) => {
  // Check if files exist
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const uploadedImages = [];
  const limit = pLimit(2); // Adjust the concurrency limit as needed

  // Define a function to upload a single image
  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject({ file, error });
          } else {
            // console.log(result);
            uploadedImages.push({
              img_name: `${result.public_id + '.' + result.format}`,
              asset_id: result.public_id,
            });
            console.log(`Successfully uploaded ${file.originalname}`);
            console.log(`> Result: ${result.secure_url}`);
            resolve(result); // Resolve with the Cloudinary result
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  };

  // Upload images concurrently using async/await and pLimit
  const uploadPromises = req.files.map((file) => {
    return limit(() => uploadImage(file));
  });

  try {
    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    // All files uploaded successfully

    const images = await Gallery.create({ images: uploadedImages });

    res.json({ uploadedImages: images });
  } catch (error) {
    // At least one file failed to upload
    res
      .status(500)
      .json({ error: 'One or more files failed to upload', details: error });
  }
};

exports.getAllImages = async (req, res) => {
  const gallery = await Gallery.find({}).sort('-createdAt');

  res.status(StatusCodes.CREATED).json({ gallery });
};

exports.deleteImage = async (req, res) => {
  try {
    const { asset_id } = req.params;

    const gallery = await Gallery.findOne({
      'images.asset_id': asset_id,
    });

    if (!gallery) {
      return res
        .status(404)
        .json({ success: false, message: 'Image not found in the gallery' });
    }

    const result = await gallery.deleteImage(asset_id);

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
