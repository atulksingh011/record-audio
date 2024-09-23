const Datastore = require('nedb');
const fs = require('fs');
const CONSTANTS = require('./constants');
const { getDbFilePath } = require('./utils');
const { uploadDbToS3, downloadDbFromS3 } = require('./s3');

const dbFilePath = getDbFilePath();
let db;

exports.getDB = () => db;

exports.initializeDatabase = async () => {
    // Check if database file exists, if not, download from S3
    if (!fs.existsSync(dbFilePath)) {
        console.log('Database file not found. Downloading from S3...');
        await downloadDbFromS3();
    }

    db = new Datastore({ filename: CONSTANTS.DB_FILE_NAME, autoload: true }); // Use a file for persistent storage
}

exports.startPeriodicUpload  = () => {
    setInterval(uploadDbToS3, 2 * 60 * 1000); // 5 minutes in milliseconds
}

// Function to get paginated records
exports.getPaginatedRecords = (pageNo, limit) => {
    return new Promise((resolve, reject) => {
        db.find({})
            .sort({ _id: -1 }) // Sort by descending order
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
        db.count({}, (err, count) => {
            if (err) {
                return reject(err);
            }
            resolve(count);
        });
    });
};
