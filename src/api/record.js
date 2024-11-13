const recordRouter = require("express").Router();
const namesToRecord = require("../../namesToRecord.json");
const { getDB } = require("../db");

// Fetch Text to record API
recordRouter.get('/fetch-text-to-record', async (req, res) => {
    try {
        // Check if user information exists in signed cookies
        const userName = req.signedCookies.user;
        if (!userName) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        // Fetch the user from the database by name
        const user = await new Promise((resolve, reject) => {
            getDB().usersDB.findOne({ name: userName }, (err, doc) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });

        // If user not found, return an error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the index from the user record
        const { index } = user;

        // Check if index exists in the JSON data
        if (index < 0 || index >= namesToRecord.length) {
            return res.status(400).json({ error: 'Invalid index in user data' });
        }

        const name = namesToRecord[index];
        
        // Respond with the name
        if (name) {
            return res.json(name);
        } else {
            return res.status(400).json({ error: 'Name not found at specified index' });
        }

    } catch (error) {
        console.error('Error fetching text to record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = recordRouter;
