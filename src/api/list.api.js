const { getTotalCount, getPaginatedRecords } = require("../db");
const { generatePresignedUrl } = require("../s3");

const listRouter = require("express").Router();

// List API
listRouter.get('/', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo, 10) || 1; // Default to page 1
    const limit = 20; // Number of records per page

    try {
        const totalRecords = await getTotalCount();
        const totalPages = Math.ceil(totalRecords / limit);

        const records = await getPaginatedRecords(pageNo, limit);

        // Generate signed URLs for audio files
        const signedRecords = await Promise.all(
            records.map(async (record) => {
                const signedUrl = await generatePresignedUrl(record.audioKey);
                return { ...record, signedUrl };
            })
        );

        res.json({
            totalPages,
            totalRecords,
            currentPage: pageNo,
            records: signedRecords,
        });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).send('Failed to fetch records.');
    }
});

module.exports = listRouter;
