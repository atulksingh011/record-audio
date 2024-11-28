const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Function to convert audio to WAV format with a 16kHz sampling rate
function convertToWav(inputFilePath, outputDir) {
    const outputFileName = path.basename(inputFilePath, path.extname(inputFilePath)) + '.wav';
    const outputFilePath = path.join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .audioFrequency(16000) // Set sampling rate to 16kHz
            .audioChannels(1) // Optional: Convert to mono
            .toFormat('wav')
            .on('end', () => {
                console.log(`Converted: ${outputFilePath}`);
                resolve(outputFilePath);
            })
            .on('error', (err) => {
                console.error(`Error converting ${inputFilePath}:`, err.message);
                reject(err);
            })
            .save(outputFilePath);
    });
}

// Main function to process all audio files in the directory
async function convertDirectoryToWav(inputDir) {
    try {
        // Validate input directory
        if (!fs.existsSync(inputDir)) {
            throw new Error(`Input directory does not exist: ${inputDir}`);
        }

        const outputDir = path.join(inputDir, "../", 'audio-wav');

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        const files = fs.readdirSync(inputDir);
        const audioFiles = files.filter(file => /\.(mp3|aac|flac|ogg|m4a|wav)$/i.test(file));

        if (audioFiles.length === 0) {
            console.log('No audio files found in the specified directory.');
            return;
        }

        console.log(`Found ${audioFiles.length} audio files. Converting to WAV format...`);

        for (const file of audioFiles) {
            const inputFilePath = path.join(inputDir, file);
            try {
                await convertToWav(inputFilePath, outputDir);
            } catch (err) {
                console.error(`Failed to convert ${file}:`, err.message);
            }
        }

        console.log(`All audio files have been processed. Converted files are in: ${outputDir}`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Get input directory from command-line arguments
const inputDir = process.argv[2];
if (!inputDir) {
    console.error('Please provide the path to the directory containing audio files.');
    process.exit(1);
}

convertDirectoryToWav(inputDir);
