// viewRecords.js
const Datastore = require("nedb");
const path = require("path");

// Adjust the path to your db file
const dbFilePath = path.join(__dirname, "../", "records.db");
const db = new Datastore({ filename: dbFilePath, autoload: true });

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
db.find({}, (err, docs) => {
  if (err) {
    console.error("Error fetching records:", err);
    return;
  }
  console.log("Records:", docs);
});


