const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../../config/s3.config');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

exports.uploadProductImage = async (imageData) => {
    // 1. Parse the base64 string (Format: "data:image/png;base64,iVBORw0KGgo...")
    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid image data format. Expected base64 string.');
    }

    const mimeType = matches[1]; // e.g., 'image/png' or 'image/jpeg'
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 2. Generate a unique file name (Key)
    const extension = mimeType.split('/')[1];
    const key = `products/${uuidv4()}.${extension}`;

    // 3. Prepare the upload command
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // Uncomment the line below if your bucket doesn't use bucket policies for public access
        // ACL: 'public-read' 
    });

    // 4. Upload to S3
    await s3Client.send(command);

    // 5. Construct the public URL
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        imageUrl: imageUrl,
        publicId: key // We return the S3 key here so the controller doesn't break
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

// NEW: Helper to extract Key from URL and delete (used when deleting a product row)
exports.deleteImageByUrl = async (imageUrl) => {
    if (!imageUrl) return;
    try {
        const url = new URL(imageUrl);
        // S3 URL path usually looks like "/products/filename.png"
        // We remove the leading slash to get the exact Key: "products/filename.png"
        const key = url.pathname.substring(1); 
        await this.deleteProductImage(key);
    } catch (error) {
        console.error(`Failed to delete image by URL: ${imageUrl}`, error);
    }
};