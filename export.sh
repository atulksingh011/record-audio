#!/bin/bash

rm -rf export/*
docker exec -it record-names node ./src/export.js
cd export 
tar -czvf audio.tar.gz -C audio .
rm -rf audio
