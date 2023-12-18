const { StatusCodes } = require('http-status-codes');
const cloudinary = require('cloudinary').v2;

const Post = require('../models/Post');

const pLimit = require('p-limit');

exports.addPost = async (req, res) => {
  const { title, content } = req.body;

  const uploadedImages = [];
  const limit = pLimit(2); // Adjust the concurrency limit as needed

  if (req.files.length > 10) {
    throw new Error('Max Upload limit is 10');
  }

  // Define a function to upload a single image
  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
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
    if (!file.mimetype.startsWith('image')) {
      throw new Error('Please upload image only');
    }

    return limit(() => uploadImage(file));
  });

  try {
    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    // All files uploaded successfully

    // const images = await Gallery.create({ images: uploadedImages });

    const images = uploadedImages;

    const post = await Post.create({ title, content, images });

    res.json({ post });
  } catch (error) {
    // At least one file failed to upload
    res
      .status(500)
      .json({ error: 'One or more files failed to upload', details: error });
  }
};

exports.getAllPosts = async (req, res) => {
  const posts = await Post.find({})
    .sort('-createdAt')
    .select('-createdAt -updatedAt -updatedAt');

  res.status(StatusCodes.OK).json(posts);
};

exports.getPost = async (req, res) => {
  const id = req.params.id;

  const post = await Post.findById(id);

  if (!post) {
    throw new Error(`No post found with id ${id}`);
  }

  res.status(StatusCodes.OK).json(post);
};

exports.updatePost = async (req, res) => {
  const postId = req.params.id; // Assuming the post ID is in the request parameters
  const { title, content } = req.body;

  const uploadedImages = [];
  const limit = pLimit(2); // Adjust the concurrency limit as needed

  if (req.files.length > 10) {
    throw new Error('Max Upload limit is 10');
  }

  // Define a function to upload a single image
  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            reject({ file, error });
          } else {
            uploadedImages.unshift({
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
    if (!file.mimetype.startsWith('image')) {
      throw new Error('Please upload image only');
    }

    return limit(() => uploadImage(file));
  });

  try {
    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    // All files uploaded successfully

    // Fetch the existing post
    const existingPost = await Post.findById(postId);

    if (!existingPost) {
      throw new Error(`No post found with id ${postId}`);
    }

    // Combine existing images with newly uploaded images
    const combinedImages = [...uploadedImages, ...existingPost.images];

    // Update the existing post with new title, content, and combined images
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title: title ? title : existingPost.title,
        content: content ? content : existingPost.content,
        images: combinedImages,
      },
      { new: true } // Return the updated document
    );

    if (!updatedPost) {
      throw new Error(`No post found with id ${postId}`);
    }

    res.json({ post: updatedPost });
  } catch (error) {
    // At least one file failed to upload
    res
      .status(500)
      .json({ error: 'One or more files failed to upload', details: error });
  }
};

exports.deletePost = async (req, res) => {
  const id = req.params.id;

  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    throw new Error(`No post found with id ${id}`);
  }

  await post.deleteAllImages();

  res.status(StatusCodes.OK).json({ msg: 'Post deleted successfully' });
};

exports.deleteImage = async (req, res) => {
  try {
    const { id, assetId } = req.params;

    const post = await Post.findOne({
      _id: id,
      'images.asset_id': assetId,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Image not found in the post' });
    }

    const result = await post.deleteImage(assetId);

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
