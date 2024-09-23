#!/bin/bash

# Check if .env.prod exists
if [[ -f .env.prod ]]; then
    ENV_FILE_OPTION="--env-file .env.prod"
else
    echo ".env.prod file not found. Using default environment variables."
    ENV_FILE_OPTION=""
fi

docker container run \
    -d \
    --rm \
    --name record-audio \
    $ENV_FILE_OPTION \
    -p 3000:3000 \
    -v $(pwd)/.env:/app/.env \
    -v $(pwd)/public:/app/public \
    -v $(pwd)/src:/app/src \
    -v $(pwd)/package.json:/app/package.json \
    -v $(pwd)/nodemon.json:/app/nodemon.json \
    record-audio:latest \
    "$@"
