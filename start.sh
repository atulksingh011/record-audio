#!/bin/bash

docker container run \
    -d \
    --rm \
    --name record-audio \
    -p 3000:3000 \
    -v $(pwd)/.env:/app/.env \
    -v $(pwd)/public:/app/public \
    -v $(pwd)/src:/app/src \
    -v $(pwd)/package.json:/app/package.json \
    record-audio:latest \
    "$@"
