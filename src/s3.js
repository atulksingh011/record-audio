const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');
const { getDbFilePath } = require("./utils");

const dbFilePath = getDbFilePath();

// Create S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

exports.s3Client = s3Client;

// Function to upload the database file to S3
exports.uploadDbToS3 = async () => {
    try {
        const fileStream = fs.createReadStream(dbFilePath);
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'db/records.db', // Path in S3
            Body: fileStream,
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log('Database uploaded to S3 successfully.');
    } catch (error) {
        console.error('Error uploading database to S3:', error);
    }
};

// Function to download the database file from S3
exports.downloadDbFromS3 = async () => {
    try {
        const downloadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'db/records.db', // Path in S3
        };
        const data = await s3Client.send(new GetObjectCommand(downloadParams));
        const writeStream = fs.createWriteStream(dbFilePath);
        data.Body.pipe(writeStream);
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                console.log('Database downloaded from S3 successfully.');
                resolve();
            });
            writeStream.on('error', (error) => {
                console.error('Error writing to file:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error downloading database from S3:', error);
    }
};

// Function to generate a signed URL for the audio file
exports.generatePresignedUrl = async (audioKey) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: audioKey,
    };

    try {
        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};