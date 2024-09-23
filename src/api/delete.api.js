const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../s3");
const { getDB } = require("../db");

const deleteRouter = require("express").Router();

// List API
deleteRouter.delete('/', async (req, res) => {
    const recordId = req.query.id; // Get the record ID from the query parameter

    if (!recordId) {
        return res.status(400).send('Record ID is required.');
    }

    try {
        const db = getDB(); // Get the NeDB instance

        // Find the record to delete
        db.findOne({ _id: recordId }, async (err, record) => {
            if (err || !record) {
                return res.status(404).send('Record not found.');
            }

            // Delete the audio file from S3 (if needed)
            const s3DeleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: record.audioKey,
            };

            await s3Client.send(new DeleteObjectCommand(s3DeleteParams));

            // Delete the record from NeDB
            db.remove({ _id: recordId }, {}, (err) => {
                if (err) {
                    return res.status(500).send('Failed to delete record from database.');
                }

                return res.status(200).send('Record deleted successfully.');
            });
        });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).send('Failed to delete record.');
    }
});

module.exports = deleteRouter;
