const mongoose = require('mongoose');

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

module.exports = mongoose.model('Gallery', GallerySchema);
