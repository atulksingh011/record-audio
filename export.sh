#!/bin/bash

rm -rf export/*
docker exec -it record-names node ./src/export.js
docker exec -it record-names node src/convert-audio-to-wav.js export/audio
docker exec -it record-names node src/generate-audio-info.js export/audio-wav
cd export 
tar -czvf audio.tar.gz -C audio-wav .
rm -rf audio
rm -rf audio-wav
