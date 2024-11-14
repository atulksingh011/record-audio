const { getDB } = require("./db");

exports.incrementRecordIndex = async (user, index) => {
    try {
        // Fetch the user's record from the database
        const userRecord = await new Promise((resolve, reject) => {
            getDB().usersDB.findOne({ name: user }, (err, doc) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });

        if (!userRecord) {
            throw new Error("User not found");
        }

        // Get the current index and user index array
        let userIndex = userRecord.index; // Assuming index is an array
        if (!Array.isArray(userIndex)) {
            throw new Error("Index format is not correct");
        }
        
        // If the given index is the last one in the array, increment it
        if (userIndex[userIndex.length - 1] === index) {
            // Increment the last index and update it
            userIndex[userIndex.length - 1] = index + 1;
        } else {
            // Otherwise, remove the index from the array
            userIndex = userIndex.filter((item) => item !== index);
            // Optionally add the removed index back if needed, but it's not specified
        }

        // Update the user's index array in the database
        await new Promise((resolve, reject) => {
            getDB().usersDB.update(
                { name: user },
                { $set: { index: userIndex } }, // Update the index array
                {},
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log(`User ${user} index updated successfully.`);
    } catch (error) {
        console.error("Error updating user index:", error);
        throw error;
    }
};

exports.appendIndexToUserIndex = async (user, index) => {
    try {
        // Fetch the user's record from the database
        const userRecord = await new Promise((resolve, reject) => {
            getDB().usersDB.findOne({ name: user }, (err, doc) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });

        if (!userRecord) {
            throw new Error("User not found");
        }

        // Get the current index and user index array
        let userIndex = userRecord.index; // Assuming index is an array
        if (!Array.isArray(userIndex)) {
            throw new Error("Index format is not correct");
        }

        // Append the new index to the user's index array
        userIndex.push(index);

        // Sort the array in ascending order
        userIndex.sort((a, b) => a - b); // Sorting numerically in ascending order

        // Update the user's index array in the database
        await new Promise((resolve, reject) => {
            getDB().usersDB.update(
                { name: user },
                { $set: { index: userIndex } }, // Update the index array
                {},
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log(`Index ${index} appended to user ${user} and sorted successfully.`);
    } catch (error) {
        console.error("Error appending index to user:", error);
        throw error;
    }
};

exports.getRecordIndex = async (user) => {
    try {
        // Assuming user has an index array (or a simple index value)
        const userData = await new Promise((resolve, reject) => {
            getDB().usersDB.findOne({ name: user }, (err, doc) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });

        // If no user found, return a default or handle accordingly
        if (!userData) {
            throw new Error('User not found');
        }

        return userData.index[0];
    } catch (error) {
        console.error('Error fetching user index:', error);
        throw error;  // Re-throw error to be handled at the route level
    }
};