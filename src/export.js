const fs = require("fs");
const path = require("path");
const Datastore = require("nedb");
const http = require('http');
const https = require('https');
const { generatePresignedUrl } = require("./s3");

const recordDBFilePath = path.join(__dirname, "../", "data/record.db");
const db = new Datastore({ filename: recordDBFilePath, autoload: true });

const createMetadataAndDownloadAudio = async (records) => {
    try {
        const exportDir = path.join(__dirname, "../export");
        const audioDir = path.join(exportDir, "audio");
        const metadataFile = path.join(exportDir, "metadata.jsonl");

        // Ensure the audio directory exists
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir);
        }

        const metadataStream = fs.createWriteStream(metadataFile, { flags: "w" });

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const audioKey = record.english;

            if (!audioKey) {
                console.warn(`Record with text "${record.text}" does not have an English audio key.`);
                continue;
            }

            try {
                // Generate a signed URL for the audio file
                const signedUrl = await generatePresignedUrl(audioKey);
                const protocol = signedUrl.startsWith('https') ? https : http;

                // Download the audio file
                const fileName = `audio_${i}.wav`; // Generate a file name
                const filePath = path.join(audioDir, fileName);

                await new Promise((resolve, reject) => {
                    const fileStream = fs.createWriteStream(filePath);
                    const request = protocol.get(signedUrl, (response) => {
                        if (response.statusCode !== 200) {
                            reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
                            return;
                        }
                        response.pipe(fileStream);
                        response.on('end', resolve);
                        response.on('error', reject);
                    });

                    request.on('error', reject);
                    fileStream.on('error', reject);
                });

                console.log(`Downloaded ${fileName} successfully.`);

                // Write metadata
                const metadataEntry = {
                    sentence: record.text,
                    file_name: fileName,
                };
                metadataStream.write(JSON.stringify(metadataEntry) + "\n");
            } catch (error) {
                console.error(`Error processing record with text "${record.text}":`, error);
            }
        }

        metadataStream.end();
        console.log("Metadata file created successfully.");
    } catch (error) {
        console.error("Error creating metadata and downloading audio:", error);
    }
};

// Example usage with records fetched from NeDB
const fetchAndProcessRecords = async () => {
    db.find({})
        .exec((err, docs) => {
            if (err) {
                console.error("Error fetching records:", err);
                return;
            }
            createMetadataAndDownloadAudio(docs);
        });
};

// Run the process
fetchAndProcessRecords();
