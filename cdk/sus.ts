#!/usr/bin/env node
import 'source-map-support/register';
import { App, RemovalPolicy, Stack, StackProps, aws_apigatewayv2 as apigw, aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as go from '@aws-cdk/aws-lambda-go-alpha';
import { join } from 'path';

class SusStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "UploadBucket", {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    })

    const api = new apigw.HttpApi(this, "Api", {})

    const uploadFunction = new go.GoFunction(this, "UploadFunction", {
      entry: join(__dirname, "..", "lambda", "upload"),
      environment: {
        "UPLOAD_BUCKET": bucket.bucketName,
      }
    })
  }
}

const app = new App();
new SusStack(app, 'SusStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});