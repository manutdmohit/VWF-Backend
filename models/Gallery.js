const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2; // Make sure to install the 'cloudinary' package

const GallerySchema = new mongoose.Schema(
  {
    images: [
      {
        img_name: String,
        asset_id: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create an index on the 'asset_id' field
GallerySchema.index({ 'images.asset_id': 1 });

// Define a method to delete an image by asset_id
GallerySchema.methods.deleteImage = async function (asset_id) {
  try {
    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(asset_id);

    // Remove the image from the MongoDB document
    this.images = this.images.filter((image) => image.asset_id !== asset_id);

    // Save the updated document to the database
    await this.save();

    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, message: 'Error deleting image' };
  }
};

const Gallery = mongoose.model('Gallery', GallerySchema);

module.exports = Gallery;
