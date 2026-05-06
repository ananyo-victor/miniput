const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../../config/s3.config');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

exports.uploadProductImage = async (imageData) => {
    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid image data format. Expected base64 string.');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const extension = mimeType.split('/')[1];
    const key = `products/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
    });

    await s3Client.send(command);

    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        imageUrl: imageUrl,
        publicId: key
    };
};

exports.deleteProductImage = async (fileKey) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey
        });
        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error("Error deleting from S3:", error);
        throw new Error("Failed to delete image from bucket");
    }
};

exports.deleteImageByUrl = async (imageUrl) => {
    if (!imageUrl) return;
    try {
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1); 
        await this.deleteProductImage(key);
    } catch (error) {
        console.error(`Failed to delete image by URL: ${imageUrl}`, error);
    }
};