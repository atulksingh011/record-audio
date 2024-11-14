const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../s3");
const { getDB } = require("../db");
const { appendIndexToUserIndex } = require("../users");

const deleteRouter = require("express").Router();

// List API
deleteRouter.delete('/', async (req, res) => {
    const recordId = req.query.id; // Get the record ID from the query parameter

    if (!recordId) {
        return res.status(400).send('Record ID is required.');
    }

    try {
        const db = getDB().recordDB; // Get the NeDB instance

        // Find the record to delete
        db.findOne({ _id: recordId }, async (err, record) => {
            if (err || !record) {
                return res.status(404).send('Record not found.');
            }

            // Prepare the S3 delete parameters for both English and Hindi files
            const deletePromises = [];
            if (record.english) {
                const englishDeleteParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: record.english, // English file path stored in the record
                };
                deletePromises.push(s3Client.send(new DeleteObjectCommand(englishDeleteParams)));
            }
            if (record.hindi) {
                const hindiDeleteParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: record.hindi, // Hindi file path stored in the record
                };
                deletePromises.push(s3Client.send(new DeleteObjectCommand(hindiDeleteParams)));
            }

            try {
                // Delete both audio files from S3 (if they exist)
                await Promise.all(deletePromises);
                const userName = record.createdBy;

                if (userName) {
                    // Append the deleted index back to the user's index list
                    await appendIndexToUserIndex(userName, record.index);  // Assuming `index` is stored in the record
                }

                // Delete the record from NeDB
                db.remove({ _id: recordId }, {}, (err) => {
                    if (err) {
                        return res.status(500).send('Failed to delete record from database.');
                    }

                    return res.status(200).send('Record and associated audio files deleted successfully.');
                });
            } catch (s3Error) {
                console.error('Error deleting audio files from S3:', s3Error);
                return res.status(500).send('Failed to delete audio files from S3.');
            }
        });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).send('Failed to delete record.');
    }
});

module.exports = deleteRouter;
