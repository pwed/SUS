package main

import (
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/s3"
    "log"
    "strings"
    "time"
)

func main() {
    // Initialize a session in us-west-2 that the SDK will use to load
    // credentials from the shared credentials file ~/.aws/credentials.
    sess, err := session.NewSession(&aws.Config{})

    // Create S3 service client
    svc := s3.New(sess)

    req, _ := svc.PutObjectRequest(&s3.PutObjectInput{
        Bucket: aws.String("myBucket"),
        Key:    aws.String("myKey"),
        Body:   strings.NewReader("EXPECTED CONTENTS"),
    })
    str, err := req.Presign(15 * time.Minute)

    log.Println("The URL is:", str, " err:", err)
}