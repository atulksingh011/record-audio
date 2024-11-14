const fetchRouter = require("express").Router();
const namesToRecord = require("../../namesToRecord.json");
const { getRecordIndex } = require("../users");

// Fetch Text to record API
fetchRouter.get('/', async (req, res) => {
    try {
        // Check if user information exists in signed cookies
        const userName = req.signedCookies.user;
        if (!userName) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        // Get the index from the user record
        const index = await getRecordIndex(userName);

        // Check if index exists in the JSON data
        if (index < 0 || index >= namesToRecord.length) {
            return res.status(400).json({ error: 'Invalid index in user data' });
        }

        const name = namesToRecord[index]?.name;
        
        // Respond with the name
        if (name) {
            return res.json({
                name,
                index
            });
        } else {
            return res.status(400).json({ error: 'Name not found at specified index' });
        }

    } catch (error) {
        console.error('Error fetching text to record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = fetchRouter;
