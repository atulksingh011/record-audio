const fs = require('fs');
const path = require('path');
const tar = require('tar');

const compressAudioDir = async () => {
    const exportDir = path.join(__dirname, "../export");
    const audioDir = path.join(exportDir, "audio");
    const outputTarGz = path.join(exportDir, 'audio.tar.gz');

    if (!fs.existsSync(exportDir)) {
        console.error(`The directory "${exportDir}" does not exist.`);
        return;
    }

    if (!fs.existsSync(audioDir)) {
        console.error(`The directory "${audioDir}" does not exist.`);
        return;
    }

    try {
        console.log('Compressing the audio directory...');

        await tar.c(
            {
                gzip: true,
                file: outputTarGz,
                cwd: exportDir,
            },
            ['audio'] // Include the directory in the archive
        );

        console.log(`Compressed directory "${audioDir}" into "${outputTarGz}" successfully.`);
    } catch (error) {
        console.error('Error compressing the audio directory:', error);
    }
};

// Run the compression
compressAudioDir();
