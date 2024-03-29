import json
import boto3
import os
from typing import List

from libs.tiny_router import TinyLambdaRouter

app = TinyLambdaRouter()

s3 = boto3.client("s3")

UPLOAD_BUCKET = os.environ.get("UPLOAD_BUCKET", "none")

@app.route("/presign", methods=["POST"])
def presign(aws_event, aws_context, kwargs):
    body = json.loads(aws_event["body"])
    presigned_urls = {}
    for file in body["files"]:
        response = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": UPLOAD_BUCKET,
                "Key": file["name"],
                "ContentType": file["type"],
                "ContentLength": file["size"],
            },
            ExpiresIn=3600,
            HttpMethod="PUT",
        )
        presigned_urls[file["name"]] = response
    return {
        "statusCode": 200,
        "body": json.dumps(presigned_urls),
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Method": "POST",
        },
    }


def lambda_handler(event, context):
    # print(json.dumps(event))
    return app.run(event, context)


if __name__ == "__main__":
    events = [
        {"path": "/presign", "httpMethod": "POST"},
    ]
    context = None
    for event in events:
        try:
            print("Resp:", lambda_handler(event, context))
        except Exception as e:
            print(e)
            print("----------------------")
