const cloudinary = require('../../config/cloudinary.config');

exports.uploadProductImage = async (imageData) => {
    const uploadResult = await cloudinary.uploader.upload(imageData, {
        folder: 'products'
    });

    return {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
    };
};