const Datastore = require('nedb');
const fs = require('fs');
const CONSTANTS = require('./constants');
const { getDbFilePath } = require('./utils');
const { uploadDbToS3, downloadDbFromS3 } = require('./s3');

const dbFilePath = getDbFilePath();
let usersDB;
let recordDB;

exports.getDB = () => ({
    usersDB,
    recordDB
});

exports.initializeDatabase = async () => {
    // Check if database file exists, if not, download from S3
    if (!fs.existsSync(dbFilePath)) {
        fs.mkdirSync(dbFilePath);
        console.log('Database file not found. Downloading from S3...');
        await downloadDbFromS3();
    }

    usersDB = new Datastore({ filename: CONSTANTS.USERS_DB, autoload: true }); // Use a file for persistent storage
    recordDB = new Datastore({ filename: CONSTANTS.RECORD_DB, autoload: true }); 
}

exports.startPeriodicUpload  = () => {
    setInterval(uploadDbToS3, 2 * 60 * 1000); // 2 minutes in milliseconds
}

exports.initializeUsers = async () => {
    try {
        // Get all existing user names
        const existingUsers = await new Promise((resolve, reject) => {
            usersDB.find({}, (err, docs) => {
                if (err) reject(err);
                else resolve(docs.map(user => user.name));
            });
        });

        // Filter out names that already exist in the database
        const usersToCreate = process.env.USERS
            .split(',')
            .filter(name => !existingUsers.includes(name))
            .map((name, index) => ({ name, index }));

        // Insert the new user records if any are missing
        if (usersToCreate.length > 0) {
            await new Promise((resolve, reject) => {
                usersDB.insert(usersToCreate, (err, newDocs) => {
                    if (err) reject(err);
                    else resolve(newDocs);
                });
            });
            console.log(`${usersToCreate.length} user(s) created.`);
        } else {
            console.log('All specified users already exist.');
        }
    } catch (error) {
        console.error('Error initializing users:', error);
    }
}

// Function to get paginated records
exports.getPaginatedRecords = (pageNo, limit) => {
    return new Promise((resolve, reject) => {
        recordDB.find({})
            .sort({ createdAt: -1 }) // Sort by descending order
            .skip((pageNo - 1) * limit)
            .limit(limit)
            .exec((err, docs) => {
                if (err) {
                    return reject(err);
                }
                resolve(docs);
            });
    });
};

// Function to get total number of records
exports.getTotalCount = () => {
    return new Promise((resolve, reject) => {
        recordDB.count({}, (err, count) => {
            if (err) {
                return reject(err);
            }
            resolve(count);
        });
    });
};
