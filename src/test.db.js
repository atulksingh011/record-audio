// viewRecords.js
const Datastore = require("nedb");
const path = require("path");

// Adjust the path to your db file
const usersDBFilePath = path.join(__dirname, "../", "data/users.db");
const recordDBFilePath = path.join(__dirname, "../", "data/record.db");
const db = new Datastore({ filename: recordDBFilePath, autoload: true });

// db.insert(
//   {
//     sentasdfence: "testing",
//     sdf: "testing",
//     createdAt: new Date(),
//   },
//   (err, newDoc) => {
//     if (err) {
//       console.error("Failed to save record to the database.");
//     }

//     console.log("Record saved successfully.");
//   }
// );

// db.remove({ _id: "pVwDY04xKBuN6IL9" }, {}, (err) => {
//     if (err) {
//         console.error('Failed to delete record from database.');
//     }

//     console.log('Record deleted successfully.');
// });

// Fetch all records
db.find({})
  .limit(5)
  .exec((err, docs) => {
    if (err) {
      console.error("Error fetching records:", err);
      return;
    }
    console.log("First 5 Records:", docs);
  });

