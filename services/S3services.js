require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

exports.uploadToS3 = async (data, filename) => {
    const BUCKET_NAME = 'expensetracker-app';

    const s3Client = new S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY
        }
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };

    try {
        const command = new PutObjectCommand(params);
        const response = await s3Client.send(command);
        return response;
    } catch (error) {
        console.error('Error uploading to S3', error);
        throw error;
    }
};
