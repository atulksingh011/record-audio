const saveRouter = require("express").Router();
const multer = require("multer");
const { getDB } = require("../db");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { generateAudioFileName } = require("../utils");
const fs = require("fs");
const { s3Client } = require("../s3");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

saveRouter.post("/", upload.single("audio"), async (req, res) => {
  const audioFile = req.file;
  const sentence = req.body.sentence;

  if (!audioFile || !sentence) {
    return res.status(400).send("Audio and sentence are required.");
  }

  try {
    // Generate a unique audio file name
    const uniqueFileName = generateAudioFileName(audioFile.originalname);
    const s3Key = `audio/${uniqueFileName}`; // Use the unique name for S3

    // Upload audio file to S3
    const fileStream = fs.createReadStream(audioFile.path);
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: audioFile.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Save the record to NeDB
    getDB().insert(
      {
        sentence: sentence,
        audioKey: s3Key,
        createdAt: new Date(),
      },
      (err, newDoc) => {
        if (err) {
          return res.status(500).send("Failed to save record to the database.");
        }

        return res.status(200).send("Record saved successfully.");
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Failed to upload audio to S3.");
  }
});

module.exports = saveRouter;
