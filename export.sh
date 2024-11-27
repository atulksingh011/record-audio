#!/bin/bash

rm -rf export/*
docker exec -it record-names node ./src/export.js
docker exec -it record-names node ./src/compress.js
