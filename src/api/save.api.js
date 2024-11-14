const saveRouter = require("express").Router();
const multer = require("multer");
const { getDB } = require("../db");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { generateAudioFileName } = require("../utils");
const fs = require("fs");
const { s3Client } = require("../s3");
const CONSTANTS = require("../constants");
const { incrementRecordIndex } = require("../users");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

saveRouter.post("/", upload.fields([{ name: 'english' }, { name: 'hindi' }]), async (req, res) => {
  const englishFile = req.files['english']?.[0];
  const hindiFile = req.files['hindi']?.[0];
  const text = req.body.text;
  const index = Number(req.body.index);

  if (!englishFile || !hindiFile || !text || isNaN(index)) {
    return res.status(400).send("English and Hindi recordings, index and text are required.");
  }

  try {
    // Define paths for S3 storage within `record-names/recording/`
    const englishFileName = generateAudioFileName(englishFile.originalname);
    const hindiFileName = generateAudioFileName(hindiFile.originalname);
    const englishS3Key = `${CONSTANTS.RECORDING_STORAGE_PATH}/english/${englishFileName}`;
    const hindiS3Key = `${CONSTANTS.RECORDING_STORAGE_PATH}/hindi/${hindiFileName}`;
    const userName = req.signedCookies.user;

    // Upload English recording to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: englishS3Key,
      Body: fs.createReadStream(englishFile.path),
      ContentType: englishFile.mimetype,
    }));

    // Upload Hindi recording to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: hindiS3Key,
      Body: fs.createReadStream(hindiFile.path),
      ContentType: hindiFile.mimetype,
    }));

    // Save the record to NeDB
    getDB().recordDB.insert(
      {
        text,
        index,
        english: englishS3Key,
        hindi: hindiS3Key,
        createdAt: new Date(),
        createdBy: userName,
      },
      async (err, newDoc) => {
        if (err) {
          return res.status(500).send("Failed to save record to the database.");
        }

        // Update the user's index if recording was saved successfully
        try {
          await incrementRecordIndex(userName, index);
          res.status(200).send("Record saved and user index incremented successfully.");
        } catch(e) {
          console.error("Failed to increment user index:", err);
          return res.status(500).send("Failed to update user index.");
        }
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Failed to upload audio to S3.");
  } finally {
    // Clean up temporary files
    fs.unlinkSync(englishFile.path);
    fs.unlinkSync(hindiFile.path);
  }
});

module.exports = saveRouter;
