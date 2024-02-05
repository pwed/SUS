#!/bin/bash

FRONTEND_BUCKET=$(jq -r '.SusStack.FrontendBucketName' inputs.json)

aws s3 sync dist s3://$FRONTEND_BUCKET --delete