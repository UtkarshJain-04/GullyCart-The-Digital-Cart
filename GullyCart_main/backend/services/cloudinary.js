require('dotenv').config();

const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadProductImage(fileBuffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'gullycart/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

function deleteProductImage(imagePublicId) {
  if (!imagePublicId) {
    return Promise.resolve();
  }

  return cloudinary.uploader.destroy(imagePublicId, { resource_type: 'image' });
}

module.exports = {
  cloudinary,
  uploadProductImage,
  deleteProductImage,
};