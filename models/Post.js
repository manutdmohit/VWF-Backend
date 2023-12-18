const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
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

// Method to delete all images associated with the post
PostSchema.methods.deleteAllImages = async function () {
  try {
    // Delete each image from Cloudinary
    await Promise.all(
      this.images.map(async (image) => {
        await cloudinary.uploader.destroy(image.asset_id);
      })
    );

    return { success: true, message: 'All images deleted successfully' };
  } catch (error) {
    console.error('Error deleting images:', error);
    return { success: false, message: 'Error deleting images' };
  }
};

// Define a method to delete an image by asset_id
PostSchema.methods.deleteImage = async function (asset_id) {
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

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
