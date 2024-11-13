const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');
const path = require('path');
const CONSTANTS = require("./constants");
const { getDbFilePath } = require("./utils");

const dataDirPath = getDbFilePath();

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
        const files = fs.readdirSync(dataDirPath);
        for (const file of files) {
            const filePath = path.join(dataDirPath, file);
            const fileStream = fs.createReadStream(filePath);
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `record-names/data/${file}`, // Place each file in the 'data/' folder on S3
                Body: fileStream,
            };
            await s3Client.send(new PutObjectCommand(uploadParams));
            console.log(`Uploaded ${file} to S3 successfully.`);
        }
        console.log('All database files uploaded to S3 successfully.');
    } catch (error) {
        console.error('Error uploading database files to S3:', error);
    }
};

// Function to download the database file from S3
exports.downloadDbFromS3 = async () => {
    try {
        const listParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: "record-names"
        };
        const data = await s3Client.send(new ListObjectsV2Command(listParams));

        if (data && data.Contents && data.Contents.length > 0) {
            for (const item of data.Contents) {
                const fileKey = item.Key;
                const fileName = path.basename(fileKey);
                const downloadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileKey,
                };
                const fileData = await s3Client.send(new GetObjectCommand(downloadParams));
                const writeStream = fs.createWriteStream(path.join(dataDirPath, fileName));
                fileData.Body.pipe(writeStream);
    
                await new Promise((resolve, reject) => {
                    writeStream.on('finish', () => {
                        console.log(`Downloaded ${fileName} from S3 successfully.`);
                        resolve();
                    });
                    writeStream.on('error', (error) => {
                        console.error(`Error writing ${fileName} to file:`, error);
                        reject(error);
                    });
                });
            }
            console.log('All database files downloaded from S3 successfully.');
        } else {
            console.log('database backup not found, initializing a new one.');
        }
    } catch (error) {
        console.error('Error downloading database files from S3:', error);
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