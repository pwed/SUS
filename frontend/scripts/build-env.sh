#!/bin/bash

echo "PUBLIC_S3_URL=$(jq '.SusStack.Bucket' inputs.json)
PUBLIC_API_URL=$(jq '.SusStack.API' inputs.json)" > .env