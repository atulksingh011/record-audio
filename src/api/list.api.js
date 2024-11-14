const { getTotalCount, getPaginatedRecords } = require("../db");
const { generatePresignedUrl } = require("../s3");

const listRouter = require("express").Router();

// List API
listRouter.get('/', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 20; // Number of records per page
    const userName = req.signedCookies.user;

    try {
        const totalRecords = await getTotalCount(userName);
        const totalPages = Math.ceil(totalRecords / limit);

        const records = await getPaginatedRecords(userName, pageNo, limit);

        // Generate signed URLs for English and Hindi audio files
        const signedRecords = await Promise.all(
            records.map(async (record) => {
                const english = await generatePresignedUrl(record.english);
                const hindi = await generatePresignedUrl(record.hindi);
                
                return { 
                    ...record, 
                    english,
                    hindi
                };
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
