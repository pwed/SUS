#!/bin/bash

echo "PUBLIC_S3_URL=$(jq '.SusStack.UploadBucketName' inputs.json)
PUBLIC_API_URL=$(jq '.SusStack.ApiUrl' inputs.json)" > .env