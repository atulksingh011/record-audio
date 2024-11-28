const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { parse } = require('path');

// Function to get audio metadata
function getAudioMetadata(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            const format = metadata.format;
            const stream = format.streams ? format.streams.find(s => s.codec_type === 'audio') : null;
            resolve({
                fileName: path.basename(filePath),
                formatName: format.format_name || 'N/A',
                duration: format.duration || 'N/A',
                sampleRate: stream ? stream.sample_rate : 'N/A',
                codec: stream ? stream.codec_name : 'N/A',
                channels: stream ? stream.channels : 'N/A',
            });
        });
    });
}

// Function to scan a directory and process audio files
async function processAudioFiles(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        const audioFiles = files.filter(file => /\.(mp3|wav|flac|aac|ogg)$/i.test(file)); // Filter audio files

        const results = [];
        for (const file of audioFiles) {
            const filePath = path.join(dirPath, file);
            try {
                const metadata = await getAudioMetadata(filePath);
                results.push(metadata);
            } catch (err) {
                console.error(`Failed to process ${file}:`, err.message);
            }
        }

        // Write to CSV
        const csvPath = path.join(dirPath, '../', 'audio_info.csv');
        const csvContent = [
            'File Name,Format,Duration,Sample Rate,Codec,Channels', // Header
            ...results.map(
                data =>
                    `"${data.fileName}","${data.formatName}","${data.duration}","${data.sampleRate}","${data.codec}","${data.channels}"`
            ),
        ].join('\n');

        fs.writeFileSync(csvPath, csvContent, 'utf8');
        console.log(`Audio info CSV generated at: ${csvPath}`);
    } catch (err) {
        console.error('Error processing directory:', err.message);
    }
}

// Get directory path from command line argument
const dirPath = process.argv[2];
if (!dirPath) {
    console.error('Please provide a directory path containing audio files.');
    process.exit(1);
}

processAudioFiles(dirPath);
