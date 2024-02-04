#!/usr/bin/env node
import "source-map-support/register";
import {
  App,
  RemovalPolicy,
  Stack,
  StackProps,
  aws_apigatewayv2 as apigw,
  aws_apigatewayv2_integrations as apigw_i,
  aws_s3 as s3,
  aws_lambda as lambda,
  aws_s3_deployment,
  aws_s3_assets,
  aws_cloudfront as cf,
  aws_cloudfront_origins as cfo,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { join } from "path";

import { execSync } from "child_process";

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
    });

    const frontendBucket = new s3.Bucket(this, "FrontendBucket", {});

    const distribution = new cf.Distribution(this, "FrontendDistribution", {
      defaultBehavior: {
        origin: new cfo.S3Origin(frontendBucket, {
          originAccessIdentity: new cf.OriginAccessIdentity(this, "Oai"),
        }),
      },
      defaultRootObject: "index.html",
    });

    const api = new apigw.HttpApi(this, "Api", {
      corsPreflight: {
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowOrigins: [`https://${distribution.domainName}`, "http://localhost:4321"],
        allowHeaders: ["*"],
      },
    });

    const uploadFunction = new PythonFunction(this, "UploadFunction", {
      entry: join(__dirname, "..", "lambda", "upload"),
      handler: "lambda_handler",
      index: "upload.py",
      runtime: lambda.Runtime.PYTHON_3_12,
      environment: {
        UPLOAD_BUCKET: bucket.bucketName,
      },
    });
    bucket.grantWrite(uploadFunction);

    const uploadIntegration = new apigw_i.HttpLambdaIntegration(
      "UploadIntegration",
      uploadFunction,
    );

    api.addRoutes({
      integration: uploadIntegration,
      path: "/presign",
      methods: [apigw.HttpMethod.POST],
    });

    new CfnOutput(this, "API", {
      value: api.url!,
    });

    new CfnOutput(this, "Frontend", {
      value: `https://${distribution.domainName}`,
    });

    new CfnOutput(this, "Bucket", {
      value: bucket.bucketName,
    });
  }
}

const app = new App();
new SusStack(app, "SusStack", {
  env: {
    account: "806124249357",
    region: "ap-southeast-2",
  },
});
