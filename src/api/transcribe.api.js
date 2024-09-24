const transcribeRouter = require("express").Router();
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

transcribeRouter.post("/", upload.single("file"), async (req, res) => {
  const audioFilePath = req.file.path; // Get the uploaded file path

  if (!req.file) {
    return res
      .status(400)
      .send('No audio file was uploaded (missing "file" key).');
  }

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioFilePath)); // Add the audio file to form data

    const response = await axios.post(
      `${process.env.TRANSCRIBE_API}/transcribe`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Accept-Language": "en-US", // Include if needed
          accept: "application/json", // Include if the API needs it
        },
      }
    );

    res.json(response.data); // Return the response from the external API
  } catch (error) {
    console.error("Error during transcription:", error);
    res.status(500).send("Failed to transcribe audio.");
  } finally {
    // Clean up the uploaded file after processing
    fs.unlink(audioFilePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });
  }
});

if(process.env.MULTI_TRANSCRIBE === "TRUE") {
  const FT_BASE_API = process.env.TRANSCRIBE_API.replace("5001", "5003");

  transcribeRouter.post("/ft-base", upload.single("file"), async (req, res) => {
    const audioFilePath = req.file.path; // Get the uploaded file path
  
    if (!req.file) {
      return res
        .status(400)
        .send('No audio file was uploaded (missing "file" key).');
    }
  
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(audioFilePath)); // Add the audio file to form data
  
      const response = await axios.post(
        `${FT_BASE_API}/transcribe`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "Accept-Language": "en-US", // Include if needed
            accept: "application/json", // Include if the API needs it
          },
        }
      );
  
      res.json(response.data); // Return the response from the external API
    } catch (error) {
      console.error("Error during transcription:", error);
      res.status(500).send("Failed to transcribe audio.");
    } finally {
      // Clean up the uploaded file after processing
      fs.unlink(audioFilePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }
  });
}

module.exports = transcribeRouter;
